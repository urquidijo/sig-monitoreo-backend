import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ZonasModule } from './zonas/zonas.module';
import { MonitoreoModule } from './monitoreo/monitoreo.module';
import { AlertasModule } from './alertas/alertas.module';
import { NinosModule } from './ninos/ninos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ZonasModule,
    MonitoreoModule,
    AlertasModule,
    NinosModule,
  ],
})
export class AppModule {}