import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { AlertasService } from './alertas.service';
import { FiltrarAlertasDto } from './dto/filtrar-alertas.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('alertas')
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Get()
  listar(
    @Query() filtros: FiltrarAlertasDto,
    @CurrentUser() usuario: JwtPayload,
  ) {
    return this.alertasService.listar(filtros, usuario);
  }

  @Get(':id')
  obtener(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() usuario: JwtPayload,
  ) {
    return this.alertasService.obtener(id, usuario);
  }

  @Patch(':id/atender')
  marcarAtendida(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() usuario: JwtPayload,
  ) {
    return this.alertasService.marcarAtendida(id, usuario);
  }
}
