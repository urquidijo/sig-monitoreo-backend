import { Controller, Get, Post } from '@nestjs/common';
import { NinosService } from './ninos.service';

@Controller('ninos')
export class NinosController {
  constructor(private readonly ninosService: NinosService) {}

  @Post('demo')
  crearDemo() {
    return this.ninosService.crearDemo();
  }

  @Get()
  listar() {
    return this.ninosService.listar();
  }
}