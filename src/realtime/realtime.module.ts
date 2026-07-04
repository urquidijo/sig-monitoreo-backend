import { Module } from '@nestjs/common';
import { MonitoreoModule } from '../monitoreo/monitoreo.module';
import { AuthModule } from '../auth/auth.module';
import { RealtimeGateway } from './realtime.gateway';

@Module({
  imports: [MonitoreoModule, AuthModule],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
