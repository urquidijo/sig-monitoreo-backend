import { Body, Controller, Get, Post } from '@nestjs/common';
import { NinosService } from './ninos.service';

@Controller('ninos')
export class NinosController {
  constructor(private readonly ninosService: NinosService) {}

  @Post('demo')
  crearDemo() {
    return this.ninosService.crearDemo();
  }

  @Post()
  crear(@Body() body: { nombre: string; edad?: number; tutorId: number }) {
    return this.ninosService.crear({
      nombre: body.nombre,
      edad: body.edad ? Number(body.edad) : undefined,
      tutorId: Number(body.tutorId),
    });
  }

  @Get()
  listar() {
    return this.ninosService.listar();
  }
}