import { Controller, Get, Post } from '@nestjs/common';
import { ZonasService } from './zonas.service';

@Controller('zonas')
export class ZonasController {
  constructor(private readonly zonasService: ZonasService) {}

  @Post('seed-kinder')
  crearZonaKinder() {
    return this.zonasService.crearZonaKinder();
  }

  @Get()
  listarZonas() {
    return this.zonasService.listarZonas();
  }
}