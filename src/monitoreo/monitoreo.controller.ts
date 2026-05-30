import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { MonitoreoService } from './monitoreo.service';

@Controller('monitoreo')
export class MonitoreoController {
  constructor(private readonly monitoreoService: MonitoreoService) {}

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
    console.log('BODY RECIBIDO:', body);

    return this.monitoreoService.actualizarPosicion({
      ninoId: Number(body.ninoId),
      zonaId: Number(body.zonaId),
      latitud: Number(body.latitud),
      longitud: Number(body.longitud),
    });
  }

  @Get('nino/:id/ultima-posicion')
  obtenerUltimaPosicion(@Param('id', ParseIntPipe) id: number) {
    return this.monitoreoService.obtenerUltimaPosicion(id);
  }
}