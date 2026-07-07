import { Global, Module } from '@nestjs/common';
import { PresenciaService } from './presencia.service';

@Global()
@Module({
  providers: [PresenciaService],
  exports: [PresenciaService],
})
export class PresenciaModule {}
