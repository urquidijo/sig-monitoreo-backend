import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export interface PolygonGeoJson {
  type: 'Polygon';
  coordinates: number[][][];
}

export class CrearZonaDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsInt()
  centroEducativoId?: number;

  @IsObject()
  @IsNotEmpty()
  geojson: PolygonGeoJson;
}

export class ActualizarZonaDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsInt()
  centroEducativoId?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsObject()
  geojson?: PolygonGeoJson;
}
