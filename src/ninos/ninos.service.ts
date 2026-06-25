import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NinosService {
  constructor(private readonly prisma: PrismaService) {}

  async crearDemo() {
    const tutor = await this.prisma.tutor.create({
      data: {
        nombre: 'Madre o Tutor Demo',
        telefono: '70000000',
        email: 'tutor.demo@gmail.com',
        ninos: {
          create: {
            nombre: 'Nino Demo',
            edad: 5,
          },
        },
      },
      include: {
        ninos: true,
      },
    });

    return tutor;
  }

  async crear(dto: { nombre: string; edad?: number; tutorId: number }) {
    return this.prisma.nino.create({
      data: {
        nombre: dto.nombre,
        edad: dto.edad,
        tutorId: dto.tutorId,
      },
      include: {
        tutor: true,
      },
    });
  }

  async listar() {
    return this.prisma.nino.findMany({
      include: {
        tutor: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }
}