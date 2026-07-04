import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';

const SELECT_SEGURO = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  activo: true,
  createdAt: true,
  updatedAt: true,
  tutor: { select: { id: true, telefono: true } },
} as const;

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: CrearUsuarioDto) {
    const existente = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (existente) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        email: dto.email,
        passwordHash,
        rol: dto.rol,
        ...(dto.rol === 'TUTOR' && {
          tutor: {
            create: {
              nombre: dto.nombre,
              email: dto.email,
              telefono: dto.telefono,
            },
          },
        }),
      },
      select: SELECT_SEGURO,
    });
  }

  async listar() {
    return this.prisma.usuario.findMany({
      select: SELECT_SEGURO,
      orderBy: { id: 'desc' },
    });
  }

  async obtener(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: SELECT_SEGURO,
    });

    if (!usuario) {
      throw new NotFoundException(`No existe el usuario con id ${id}`);
    }

    return usuario;
  }

  async actualizar(id: number, dto: ActualizarUsuarioDto) {
    const usuario = await this.obtener(id);

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : undefined;

    return this.prisma.usuario.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        activo: dto.activo,
        passwordHash,
        ...(dto.telefono !== undefined &&
          usuario.tutor && {
            tutor: { update: { telefono: dto.telefono } },
          }),
      },
      select: SELECT_SEGURO,
    });
  }

  async desactivar(id: number) {
    await this.obtener(id);

    return this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
      select: SELECT_SEGURO,
    });
  }
}
