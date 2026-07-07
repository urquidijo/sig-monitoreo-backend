import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PresenciaService } from '../presencia/presencia.service';
import { CrearNinoDto, ActualizarNinoDto } from './dto/nino.dto';

const VIGENCIA_CODIGO_AFILIACION_MS = 30 * 60 * 1000;

@Injectable()
export class NinosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly presencia: PresenciaService,
  ) {}

  async crear(dto: CrearNinoDto) {
    return this.prisma.nino.create({
      data: {
        nombre: dto.nombre,
        edad: dto.edad,
        tutorId: dto.tutorId,
        centroEducativoId: dto.centroEducativoId,
      },
      include: { tutor: true, centroEducativo: true },
    });
  }

  async listar() {
    return this.prisma.nino.findMany({
      include: { tutor: true, centroEducativo: true },
      orderBy: { id: 'desc' },
    });
  }

  async obtener(id: number) {
    const nino = await this.prisma.nino.findUnique({
      where: { id },
      include: { tutor: true, centroEducativo: true },
    });

    if (!nino) {
      throw new NotFoundException(`No existe el niño con id ${id}`);
    }

    return nino;
  }

  async actualizar(id: number, dto: ActualizarNinoDto) {
    await this.obtener(id);

    return this.prisma.nino.update({
      where: { id },
      data: dto,
      include: { tutor: true, centroEducativo: true },
    });
  }

  async desactivar(id: number) {
    await this.obtener(id);

    return this.prisma.nino.update({
      where: { id },
      data: { activo: false },
    });
  }

  async misNinos(tutorId: number) {
    const ninos = await this.prisma.nino.findMany({
      where: { tutorId },
      orderBy: { id: 'desc' },
      include: {
        centroEducativo: true,
        dispositivos: { select: { revocado: true } },
      },
    });

    return ninos.map(({ dispositivos, ...nino }) => ({
      ...nino,
      vinculado: dispositivos.some((d) => !d.revocado),
      enLinea: this.presencia.estaConectado(nino.id),
    }));
  }

  async generarCodigoAfiliacion(ninoId: number) {
    await this.obtener(ninoId);

    let codigo: string;
    let intentos = 0;

    do {
      codigo = randomInt(0, 1_000_000).toString().padStart(6, '0');
      intentos += 1;
    } while (
      intentos < 10 &&
      (await this.prisma.codigoAfiliacion.findUnique({ where: { codigo } }))
    );

    const expiresAt = new Date(Date.now() + VIGENCIA_CODIGO_AFILIACION_MS);

    await this.prisma.codigoAfiliacion.create({
      data: { codigo, ninoId, expiresAt },
    });

    return { codigo, expiresAt };
  }

  async confirmarAfiliacion(codigo: string, tutorId: number) {
    const codigoAfiliacion = await this.prisma.codigoAfiliacion.findUnique({
      where: { codigo },
      include: { nino: true },
    });

    if (!codigoAfiliacion) {
      throw new NotFoundException('Código de afiliación inválido');
    }

    if (codigoAfiliacion.usado) {
      throw new BadRequestException('El código ya fue utilizado');
    }

    if (codigoAfiliacion.expiresAt < new Date()) {
      throw new BadRequestException('El código expiró');
    }

    if (
      codigoAfiliacion.nino.tutorId &&
      codigoAfiliacion.nino.tutorId !== tutorId
    ) {
      throw new ForbiddenException('Este niño ya tiene un tutor asignado');
    }

    const [, nino] = await this.prisma.$transaction([
      this.prisma.codigoAfiliacion.update({
        where: { codigo },
        data: { usado: true },
      }),
      this.prisma.nino.update({
        where: { id: codigoAfiliacion.ninoId },
        data: { tutorId },
        include: { centroEducativo: true },
      }),
    ]);

    return nino;
  }
}
