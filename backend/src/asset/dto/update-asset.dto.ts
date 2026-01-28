import { IsString, IsNumber, Min, IsEnum, IsOptional } from 'class-validator';
import { AssetStatus } from '@prisma/client';

export class UpdateAssetDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;
}
