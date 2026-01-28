import { IsString, IsNotEmpty } from 'class-validator';

export class GetUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;
}
