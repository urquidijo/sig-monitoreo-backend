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
import { ZonasService } from './zonas.service';
import { ActualizarZonaDto, CrearZonaDto } from './dto/zona.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('zonas')
export class ZonasController {
  constructor(private readonly zonasService: ZonasService) {}

  @Roles('ADMIN')
  @Post()
  crear(@Body() dto: CrearZonaDto) {
    return this.zonasService.crear(dto);
  }

  @Get()
  listarZonas() {
    return this.zonasService.listar();
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.zonasService.obtener(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarZonaDto,
  ) {
    return this.zonasService.actualizar(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  desactivar(@Param('id', ParseIntPipe) id: number) {
    return this.zonasService.desactivar(id);
  }
}
