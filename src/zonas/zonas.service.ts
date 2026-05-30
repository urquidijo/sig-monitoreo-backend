import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ZonasService {
  constructor(private readonly prisma: PrismaService) {}

  async crearZonaKinder() {
    const nombre = 'Kinder Área Segura';

    // Coordenadas de ejemplo en Santa Cruz.
    // Ojo: PostGIS usa longitud latitud.
    const polygonWkt = `
      POLYGON((
        -63.1819 -17.7831,
        -63.1812 -17.7831,
        -63.1812 -17.7838,
        -63.1819 -17.7838,
        -63.1819 -17.7831
      ))
    `;

    const result = await this.prisma.$queryRawUnsafe(`
      INSERT INTO zonas_monitoreo (nombre, descripcion, activo, geom, "createdAt", "updatedAt")
      VALUES (
        '${nombre}',
        'Zona segura del Kinder para monitoreo infantil',
        true,
        ST_SetSRID(ST_GeomFromText('${polygonWkt}'), 4326),
        NOW(),
        NOW()
      )
      RETURNING id, nombre, descripcion, activo;
    `);

    return result;
  }

  async listarZonas() {
    return this.prisma.$queryRaw`
      SELECT 
        id,
        nombre,
        descripcion,
        activo,
        ST_AsGeoJSON(geom)::json AS geojson,
        "createdAt",
        "updatedAt"
      FROM zonas_monitoreo
      ORDER BY id DESC;
    `;
  }
}