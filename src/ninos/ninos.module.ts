import { Module } from '@nestjs/common';
import { NinosService } from './ninos.service';
import { NinosController } from './ninos.controller';

@Module({
  providers: [NinosService],
  controllers: [NinosController],
  exports: [NinosService],
})
export class NinosModule {}
