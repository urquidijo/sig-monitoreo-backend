import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { NinosService } from './ninos.service';
import {
  ActualizarNinoDto,
  ConfirmarAfiliacionDto,
  CrearNinoDto,
} from './dto/nino.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('ninos')
export class NinosController {
  constructor(private readonly ninosService: NinosService) {}

  @Roles('ADMIN')
  @Post()
  crear(@Body() dto: CrearNinoDto) {
    return this.ninosService.crear(dto);
  }

  @Roles('ADMIN')
  @Get()
  listar() {
    return this.ninosService.listar();
  }

  @Roles('TUTOR')
  @Get('mios')
  misNinos(@CurrentUser() usuario: JwtPayload) {
    return this.ninosService.misNinos(usuario.tutorId!);
  }

  @Roles('TUTOR')
  @Post('afiliacion/confirmar')
  confirmarAfiliacion(
    @Body() dto: ConfirmarAfiliacionDto,
    @CurrentUser() usuario: JwtPayload,
  ) {
    return this.ninosService.confirmarAfiliacion(dto.codigo, usuario.tutorId!);
  }

  @Roles('ADMIN')
  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.ninosService.obtener(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarNinoDto,
  ) {
    return this.ninosService.actualizar(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  desactivar(@Param('id', ParseIntPipe) id: number) {
    return this.ninosService.desactivar(id);
  }

  @Roles('ADMIN')
  @Post(':id/codigo-afiliacion')
  generarCodigoAfiliacion(@Param('id', ParseIntPipe) id: number) {
    return this.ninosService.generarCodigoAfiliacion(id);
  }
}
