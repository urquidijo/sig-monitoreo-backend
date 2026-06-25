import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { ZonasModule } from './zonas/zonas.module';
import { MonitoreoModule } from './monitoreo/monitoreo.module';
import { AlertasModule } from './alertas/alertas.module';
import { NinosModule } from './ninos/ninos.module';
import { RealtimeModule } from './realtime/realtime.module';
import { VinculacionModule } from './vinculacion/vinculacion.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 100 }],
    }),
    PrismaModule,
    ZonasModule,
    MonitoreoModule,
    AlertasModule,
    NinosModule,
    RealtimeModule,
    VinculacionModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}