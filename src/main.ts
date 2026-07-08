import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// Las columnas createdAt son TIMESTAMP sin zona horaria, guardadas en UTC
// (la base tiene TimeZone=Etc/UTC). El driver `pg` (usado por @prisma/adapter-pg)
// interpreta esos valores "sin zona" usando la hora local del proceso, no UTC.
// Fijar TZ=UTC hace que esa interpretación coincida con lo que realmente
// guarda la base, sin importar en qué servidor/zona corra el backend.
process.env.TZ = 'UTC';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://sig-monitoreo-frontend.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
