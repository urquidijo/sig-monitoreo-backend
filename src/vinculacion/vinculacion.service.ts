import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes, randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

const VIGENCIA_CODIGO_MS = 5 * 60 * 1000;

@Injectable()
export class VinculacionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async generar(ninoId: number) {
    const nino = await this.prisma.nino.findUnique({ where: { id: ninoId } });

    if (!nino) {
      throw new NotFoundException(`No existe el niño con id ${ninoId}`);
    }

    let codigo: string;
    let intentos = 0;

    do {
      codigo = randomInt(0, 1_000_000).toString().padStart(6, '0');
      intentos += 1;
    } while (
      intentos < 10 &&
      (await this.prisma.codigoVinculacion.findUnique({ where: { codigo } }))
    );

    const expiresAt = new Date(Date.now() + VIGENCIA_CODIGO_MS);

    await this.prisma.codigoVinculacion.create({
      data: { codigo, ninoId, expiresAt },
    });

    return { codigo, expiresAt };
  }

  async confirmar(codigo: string, plataforma?: string) {
    const codigoVinculacion = await this.prisma.codigoVinculacion.findUnique({
      where: { codigo },
    });

    if (!codigoVinculacion) {
      throw new NotFoundException('Código de vinculación inválido');
    }

    if (codigoVinculacion.usado) {
      throw new BadRequestException('El código ya fue utilizado');
    }

    if (codigoVinculacion.expiresAt < new Date()) {
      throw new BadRequestException('El código expiró');
    }

    const token = randomBytes(32).toString('hex');

    const [dispositivo] = await this.prisma.$transaction([
      this.prisma.dispositivo.create({
        data: { ninoId: codigoVinculacion.ninoId, token, plataforma },
      }),
      this.prisma.codigoVinculacion.update({
        where: { codigo },
        data: { usado: true },
      }),
    ]);

    const nino = await this.prisma.nino.findUnique({
      where: { id: codigoVinculacion.ninoId },
    });

    const resultado = {
      deviceToken: token,
      ninoId: codigoVinculacion.ninoId,
      nombreNino: nino?.nombre,
    };

    this.realtimeGateway.emitirVinculacionCompletada(codigo, resultado);

    return resultado;
  }

  async revocar(dispositivoId: number) {
    const dispositivo = await this.prisma.dispositivo.findUnique({
      where: { id: dispositivoId },
    });

    if (!dispositivo) {
      throw new NotFoundException(
        `No existe el dispositivo con id ${dispositivoId}`,
      );
    }

    return this.prisma.dispositivo.update({
      where: { id: dispositivoId },
      data: { revocado: true },
    });
  }
}
