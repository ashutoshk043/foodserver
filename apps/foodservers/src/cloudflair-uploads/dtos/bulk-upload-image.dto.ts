import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ImageType } from '../schemas/bulk-image.schema';  // ← new schema

export class BulkUploadImageDto {
  @IsEnum(ImageType)
  filetype: ImageType;

  @IsOptional()
  @IsString()
  folderName?: string;
}