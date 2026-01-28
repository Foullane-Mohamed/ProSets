import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCheckoutDto {
  @IsUUID()
  @IsNotEmpty()
  assetId: string;
}
