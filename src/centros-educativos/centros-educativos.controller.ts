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
import { CentrosEducativosService } from './centros-educativos.service';
import {
  ActualizarCentroEducativoDto,
  CrearCentroEducativoDto,
} from './dto/centro-educativo.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('centros-educativos')
export class CentrosEducativosController {
  constructor(
    private readonly centrosEducativosService: CentrosEducativosService,
  ) {}

  @Roles('ADMIN')
  @Post()
  crear(@Body() dto: CrearCentroEducativoDto) {
    return this.centrosEducativosService.crear(dto);
  }

  @Get()
  listar() {
    return this.centrosEducativosService.listar();
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.centrosEducativosService.obtener(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarCentroEducativoDto,
  ) {
    return this.centrosEducativosService.actualizar(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  desactivar(@Param('id', ParseIntPipe) id: number) {
    return this.centrosEducativosService.desactivar(id);
  }
}
