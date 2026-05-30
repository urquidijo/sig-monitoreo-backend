import { Module } from '@nestjs/common';
import { MonitoreoService } from './monitoreo.service';
import { MonitoreoController } from './monitoreo.controller';

@Module({
  providers: [MonitoreoService],
  controllers: [MonitoreoController]
})
export class MonitoreoModule {}
