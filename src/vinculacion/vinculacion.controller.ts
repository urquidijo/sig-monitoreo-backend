import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { VinculacionService } from './vinculacion.service';
import { Public } from '../auth/decorators/public.decorator';

@Public()
@Controller('vinculacion')
export class VinculacionController {
  constructor(private readonly vinculacionService: VinculacionService) {}

  @Post('generar')
  generar(@Body() body: { ninoId: number }) {
    return this.vinculacionService.generar(Number(body.ninoId));
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('confirmar')
  confirmar(@Body() body: { codigo: string; plataforma?: string }) {
    return this.vinculacionService.confirmar(body.codigo, body.plataforma);
  }

  @Post('revocar')
  revocar(@Body() body: { dispositivoId: number }) {
    return this.vinculacionService.revocar(Number(body.dispositivoId));
  }
}
