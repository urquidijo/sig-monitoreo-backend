import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FiltrarAlertasDto } from './dto/filtrar-alertas.dto';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Injectable()
export class AlertasService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: FiltrarAlertasDto, usuario: JwtPayload) {
    return this.prisma.alerta.findMany({
      where: {
        ninoId: filtros.ninoId,
        atendida: filtros.atendida,
        estado: filtros.estado,
        ...(usuario.rol === 'TUTOR' && {
          nino: { tutorId: usuario.tutorId ?? -1 },
        }),
      },
      include: { nino: true },
      orderBy: { id: 'desc' },
    });
  }

  async obtener(id: number, usuario: JwtPayload) {
    const alerta = await this.prisma.alerta.findUnique({
      where: { id },
      include: { nino: true },
    });

    if (!alerta) {
      throw new NotFoundException(`No existe la alerta con id ${id}`);
    }

    this.verificarAcceso(alerta, usuario);

    return alerta;
  }

  async marcarAtendida(id: number, usuario: JwtPayload) {
    const alerta = await this.obtener(id, usuario);

    return this.prisma.alerta.update({
      where: { id: alerta.id },
      data: { atendida: true },
    });
  }

  private verificarAcceso(
    alerta: { nino: { tutorId: number | null } },
    usuario: JwtPayload,
  ) {
    if (usuario.rol === 'TUTOR' && alerta.nino.tutorId !== usuario.tutorId) {
      throw new ForbiddenException('No tienes acceso a esta alerta');
    }
  }
}
