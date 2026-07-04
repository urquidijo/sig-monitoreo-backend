import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CrearNinoDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  edad?: number;

  @IsOptional()
  @IsInt()
  tutorId?: number;

  @IsOptional()
  @IsInt()
  centroEducativoId?: number;
}

export class ActualizarNinoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  edad?: number;

  @IsOptional()
  @IsInt()
  centroEducativoId?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class ConfirmarAfiliacionDto {
  @IsString()
  codigo: string;
}
