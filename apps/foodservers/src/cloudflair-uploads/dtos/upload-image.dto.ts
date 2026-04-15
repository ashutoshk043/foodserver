import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ImageType } from '../schemas/logo_banner';

export class UploadImageDto {
  @IsEnum(ImageType)
  @IsNotEmpty()
  filetype: ImageType;

  @IsString()
  @IsOptional()
  imageName: string;
}