import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PresenciaService } from '../presencia/presencia.service';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

interface ActualizarPosicionDto {
  ninoId: number;
  zonaId: number;
  latitud: number;
  longitud: number;
}

@Injectable()
export class MonitoreoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly presencia: PresenciaService,
  ) {}

  /**
   * Panel del admin: todos los niños activos con su última posición conocida,
   * el estado de su dispositivo y si están transmitiendo en vivo ahora mismo.
   */
  async panelAdmin() {
    const ninos = await this.prisma.nino.findMany({
      where: { activo: true },
      orderBy: { id: 'asc' },
      include: {
        centroEducativo: { select: { id: true, nombre: true } },
        dispositivos: {
          select: { revocado: true, ultimaConexion: true },
          orderBy: { createdAt: 'desc' },
        },
        posiciones: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            latitud: true,
            longitud: true,
            dentroArea: true,
            createdAt: true,
          },
        },
      },
    });

    return ninos.map((nino) => {
      const dispositivoActivo =
        nino.dispositivos.find((d) => !d.revocado) ?? null;

      return {
        id: nino.id,
        nombre: nino.nombre,
        centroEducativo: nino.centroEducativo,
        ultimaPosicion: nino.posiciones[0] ?? null,
        dispositivo: {
          vinculado: dispositivoActivo !== null,
          ultimaConexion: dispositivoActivo?.ultimaConexion ?? null,
        },
        enLinea: this.presencia.estaConectado(nino.id),
      };
    });
  }

  async actualizarPosicion(dto: ActualizarPosicionDto) {
    if (!dto.ninoId || !dto.zonaId) {
      throw new BadRequestException('Faltan ninoId o zonaId');
    }

    if (Number.isNaN(dto.latitud) || Number.isNaN(dto.longitud)) {
      throw new BadRequestException('Latitud o longitud inválida');
    }

    const nino = await this.prisma.nino.findUnique({
      where: { id: dto.ninoId },
    });

    if (!nino) {
      throw new NotFoundException(`No existe el niño con id ${dto.ninoId}`);
    }

    const validacion = await this.prisma.$queryRaw<
      { dentro: boolean | null }[]
    >`
      SELECT ST_Contains(
        z.geom,
        ST_SetSRID(ST_MakePoint(${dto.longitud}, ${dto.latitud}), 4326)
      ) AS dentro
      FROM zonas_monitoreo z
      WHERE z.id = ${dto.zonaId};
    `;

    if (!validacion.length) {
      throw new NotFoundException(`No existe la zona con id ${dto.zonaId}`);
    }

    if (validacion[0].dentro === null) {
      throw new BadRequestException(
        'La zona existe, pero no tiene geometría válida en el campo geom',
      );
    }

    const dentroArea = validacion[0].dentro;

    const alerta = await this.persistirPosicionYEvaluarAlerta(
      dto.ninoId,
      dto.latitud,
      dto.longitud,
      dentroArea,
    );

    return {
      ninoId: dto.ninoId,
      zonaId: dto.zonaId,
      latitud: dto.latitud,
      longitud: dto.longitud,
      dentroArea,
      alerta,
    };
  }

  async procesarPosicionAutomatica(
    ninoId: number,
    latitud: number,
    longitud: number,
  ) {
    if (Number.isNaN(latitud) || Number.isNaN(longitud)) {
      throw new BadRequestException('Latitud o longitud inválida');
    }

    // Se evalúa la geocerca solo contra las zonas del centro del niño.
    // Si el niño no tiene centro asignado, cae al comportamiento global
    // (todas las zonas activas) para no romper configuraciones simples.
    const nino = await this.prisma.nino.findUnique({
      where: { id: ninoId },
      select: { centroEducativoId: true },
    });

    const centroId = nino?.centroEducativoId ?? null;

    const validacion = await this.prisma.$queryRaw<
      { dentro: boolean | null }[]
    >`
      SELECT bool_or(
        ST_Contains(
          z.geom,
          ST_SetSRID(ST_MakePoint(${longitud}, ${latitud}), 4326)
        )
      ) AS dentro
      FROM zonas_monitoreo z
      WHERE z.activo = true
        AND (
          ${centroId}::int IS NULL
          OR z."centroEducativoId" = ${centroId}::int
        );
    `;

    const dentroArea = validacion[0]?.dentro ?? false;

    const alerta = await this.persistirPosicionYEvaluarAlerta(
      ninoId,
      latitud,
      longitud,
      dentroArea,
    );

    return { ninoId, latitud, longitud, dentroArea, alerta };
  }

  private async persistirPosicionYEvaluarAlerta(
    ninoId: number,
    latitud: number,
    longitud: number,
    dentroArea: boolean,
  ) {
    await this.prisma.$executeRaw`
      INSERT INTO posiciones_nino (
        "ninoId",
        latitud,
        longitud,
        "dentroArea",
        geom,
        "createdAt"
      )
      VALUES (
        ${ninoId},
        ${latitud},
        ${longitud},
        ${dentroArea},
        ST_SetSRID(ST_MakePoint(${longitud}, ${latitud}), 4326),
        NOW()
      );
    `;

    if (dentroArea) {
      return null;
    }

    return this.prisma.alerta.create({
      data: {
        ninoId,
        estado: 'FUERA_AREA',
        mensaje: 'El niño salió del área segura.',
        latitud,
        longitud,
      },
    });
  }

  async obtenerUltimaPosicion(ninoId: number, usuario: JwtPayload) {
    if (usuario.rol === 'TUTOR') {
      const nino = await this.prisma.nino.findUnique({
        where: { id: ninoId },
      });

      if (!nino || nino.tutorId !== usuario.tutorId) {
        throw new ForbiddenException('No tienes acceso a este niño');
      }
    }

    const posicion = await this.prisma.posicionNino.findFirst({
      where: { ninoId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        ninoId: true,
        latitud: true,
        longitud: true,
        dentroArea: true,
        createdAt: true,
      },
    });

    if (!posicion) {
      throw new NotFoundException(
        'No hay posiciones registradas para este niño',
      );
    }

    return posicion;
  }

  /** Últimas posiciones del niño en orden cronológico (para dibujar el recorrido). */
  async trayectoria(ninoId: number, usuario: JwtPayload, limite = 50) {
    if (usuario.rol === 'TUTOR') {
      const nino = await this.prisma.nino.findUnique({
        where: { id: ninoId },
      });

      if (!nino || nino.tutorId !== usuario.tutorId) {
        throw new ForbiddenException('No tienes acceso a este niño');
      }
    }

    const posiciones = await this.prisma.posicionNino.findMany({
      where: { ninoId },
      orderBy: { createdAt: 'desc' },
      take: limite,
      select: {
        latitud: true,
        longitud: true,
        dentroArea: true,
        createdAt: true,
      },
    });

    return posiciones.reverse();
  }
}
