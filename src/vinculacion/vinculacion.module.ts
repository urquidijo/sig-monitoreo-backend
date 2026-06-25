import { Module } from '@nestjs/common';
import { RealtimeModule } from '../realtime/realtime.module';
import { VinculacionController } from './vinculacion.controller';
import { VinculacionService } from './vinculacion.service';

@Module({
  imports: [RealtimeModule],
  controllers: [VinculacionController],
  providers: [VinculacionService],
})
export class VinculacionModule {}
