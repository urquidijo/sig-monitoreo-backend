import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ActualizarCentroEducativoDto,
  CrearCentroEducativoDto,
} from './dto/centro-educativo.dto';

@Injectable()
export class CentrosEducativosService {
  constructor(private readonly prisma: PrismaService) {}

  crear(dto: CrearCentroEducativoDto) {
    return this.prisma.centroEducativo.create({ data: dto });
  }

  listar() {
    return this.prisma.centroEducativo.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async obtener(id: number) {
    const centro = await this.prisma.centroEducativo.findUnique({
      where: { id },
    });

    if (!centro) {
      throw new NotFoundException(`No existe el centro educativo con id ${id}`);
    }

    return centro;
  }

  async actualizar(id: number, dto: ActualizarCentroEducativoDto) {
    await this.obtener(id);

    return this.prisma.centroEducativo.update({
      where: { id },
      data: dto,
    });
  }

  async desactivar(id: number) {
    await this.obtener(id);

    return this.prisma.centroEducativo.update({
      where: { id },
      data: { activo: false },
    });
  }
}
