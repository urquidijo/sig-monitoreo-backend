import { Module } from '@nestjs/common';
import { CentrosEducativosService } from './centros-educativos.service';
import { CentrosEducativosController } from './centros-educativos.controller';

@Module({
  providers: [CentrosEducativosService],
  controllers: [CentrosEducativosController],
})
export class CentrosEducativosModule {}
