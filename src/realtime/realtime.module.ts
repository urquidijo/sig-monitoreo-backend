import { Module } from '@nestjs/common';
import { MonitoreoModule } from '../monitoreo/monitoreo.module';
import { RealtimeGateway } from './realtime.gateway';

@Module({
  imports: [MonitoreoModule],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
