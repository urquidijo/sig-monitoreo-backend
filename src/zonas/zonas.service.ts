import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ActualizarZonaDto,
  CrearZonaDto,
  PolygonGeoJson,
} from './dto/zona.dto';

export interface ZonaRow {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  centroEducativoId: number | null;
  geojson: PolygonGeoJson | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ZonasService {
  constructor(private readonly prisma: PrismaService) {}

  private geoJsonAWkt(geojson: PolygonGeoJson): string {
    if (geojson?.type !== 'Polygon' || !Array.isArray(geojson.coordinates)) {
      throw new BadRequestException(
        'geojson debe ser un Polygon válido con "coordinates"',
      );
    }

    const anillos = geojson.coordinates;

    if (anillos.length === 0) {
      throw new BadRequestException('El polígono necesita al menos un anillo');
    }

    for (const anillo of anillos) {
      if (!Array.isArray(anillo) || anillo.length < 4) {
        throw new BadRequestException(
          'Cada anillo del polígono necesita al menos 4 puntos',
        );
      }

      for (const punto of anillo) {
        if (
          !Array.isArray(punto) ||
          punto.length !== 2 ||
          typeof punto[0] !== 'number' ||
          typeof punto[1] !== 'number'
        ) {
          throw new BadRequestException(
            'Cada punto debe ser un par numérico [longitud, latitud]',
          );
        }
      }
    }

    const anillosWkt = anillos
      .map(
        (anillo) =>
          `(${anillo.map(([lng, lat]) => `${lng} ${lat}`).join(', ')})`,
      )
      .join(', ');

    return `POLYGON(${anillosWkt})`;
  }

  async crear(dto: CrearZonaDto) {
    const wkt = this.geoJsonAWkt(dto.geojson);

    const [zona] = await this.prisma.$queryRaw<{ id: number }[]>`
      INSERT INTO zonas_monitoreo (nombre, descripcion, activo, "centroEducativoId", geom, "createdAt", "updatedAt")
      VALUES (
        ${dto.nombre},
        ${dto.descripcion ?? null},
        true,
        ${dto.centroEducativoId ?? null},
        ST_SetSRID(ST_GeomFromText(${wkt}), 4326),
        NOW(),
        NOW()
      )
      RETURNING id;
    `;

    return this.obtener(zona.id);
  }

  async listar() {
    return this.prisma.$queryRaw<ZonaRow[]>`
      SELECT
        id,
        nombre,
        descripcion,
        activo,
        "centroEducativoId",
        ST_AsGeoJSON(geom)::json AS geojson,
        "createdAt",
        "updatedAt"
      FROM zonas_monitoreo
      ORDER BY id DESC;
    `;
  }

  async obtener(id: number) {
    const filas = await this.prisma.$queryRaw<ZonaRow[]>`
      SELECT
        id,
        nombre,
        descripcion,
        activo,
        "centroEducativoId",
        ST_AsGeoJSON(geom)::json AS geojson,
        "createdAt",
        "updatedAt"
      FROM zonas_monitoreo
      WHERE id = ${id};
    `;

    if (!filas.length) {
      throw new NotFoundException(`No existe la zona con id ${id}`);
    }

    return filas[0];
  }

  async actualizar(id: number, dto: ActualizarZonaDto) {
    await this.obtener(id);

    if (dto.geojson) {
      const wkt = this.geoJsonAWkt(dto.geojson);
      await this.prisma.$executeRaw`
        UPDATE zonas_monitoreo
        SET geom = ST_SetSRID(ST_GeomFromText(${wkt}), 4326), "updatedAt" = NOW()
        WHERE id = ${id};
      `;
    }

    await this.prisma.$executeRaw`
      UPDATE zonas_monitoreo
      SET
        nombre = COALESCE(${dto.nombre ?? null}, nombre),
        descripcion = COALESCE(${dto.descripcion ?? null}, descripcion),
        activo = COALESCE(${dto.activo ?? null}, activo),
        "centroEducativoId" = COALESCE(${dto.centroEducativoId ?? null}, "centroEducativoId"),
        "updatedAt" = NOW()
      WHERE id = ${id};
    `;

    return this.obtener(id);
  }

  async desactivar(id: number) {
    await this.obtener(id);

    await this.prisma.$executeRaw`
      UPDATE zonas_monitoreo SET activo = false, "updatedAt" = NOW() WHERE id = ${id};
    `;

    return this.obtener(id);
  }
}
