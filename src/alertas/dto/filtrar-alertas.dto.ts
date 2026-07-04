import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional } from 'class-validator';
import { EstadoAlerta } from '../../generated/prisma/enums';

export class FiltrarAlertasDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ninoId?: number;

  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  atendida?: boolean;

  @IsOptional()
  @IsEnum(EstadoAlerta)
  estado?: EstadoAlerta;
}
