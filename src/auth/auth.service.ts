import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      include: { tutor: true },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);

    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      tutorId: usuario.tutor?.id ?? null,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      usuario: payload,
    };
  }

  async guardarPushToken(tutorId: number | null, token: string) {
    if (!tutorId || !token) {
      return { ok: false };
    }

    await this.prisma.tutor.update({
      where: { id: tutorId },
      data: { pushToken: token },
    });

    return { ok: true };
  }
}
