import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface ActualizarPosicionDto {
  ninoId: number;
  zonaId: number;
  latitud: number;
  longitud: number;
}

@Injectable()
export class MonitoreoService {
  constructor(private readonly prisma: PrismaService) {}

  async actualizarPosicion(dto: ActualizarPosicionDto) {
    console.log('DTO EN SERVICE:', dto);

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
        ${dto.ninoId},
        ${dto.latitud},
        ${dto.longitud},
        ${dentroArea},
        ST_SetSRID(ST_MakePoint(${dto.longitud}, ${dto.latitud}), 4326),
        NOW()
      );
    `;

    let alerta: any = null;

    if (!dentroArea) {
      alerta = await this.prisma.alerta.create({
        data: {
          ninoId: dto.ninoId,
          estado: 'FUERA_AREA',
          mensaje: 'El niño salió del área segura del Kinder.',
          latitud: dto.latitud,
          longitud: dto.longitud,
        },
      });
    }

    return {
      ninoId: dto.ninoId,
      zonaId: dto.zonaId,
      latitud: dto.latitud,
      longitud: dto.longitud,
      dentroArea,
      alerta,
    };
  }

  async obtenerUltimaPosicion(ninoId: number) {
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
      throw new NotFoundException('No hay posiciones registradas para este niño');
    }

    return posicion;
  }
}