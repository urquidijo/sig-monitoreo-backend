import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { MonitoreoService } from './monitoreo.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('monitoreo')
export class MonitoreoController {
  constructor(private readonly monitoreoService: MonitoreoService) {}

  @Roles('ADMIN')
  @Post('posicion')
  actualizarPosicion(
    @Body()
    body: {
      ninoId: number;
      zonaId: number;
      latitud: number;
      longitud: number;
    },
  ) {
    return this.monitoreoService.actualizarPosicion({
      ninoId: Number(body.ninoId),
      zonaId: Number(body.zonaId),
      latitud: Number(body.latitud),
      longitud: Number(body.longitud),
    });
  }

  @Get('nino/:id/ultima-posicion')
  obtenerUltimaPosicion(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() usuario: JwtPayload,
  ) {
    return this.monitoreoService.obtenerUltimaPosicion(id, usuario);
  }
}
