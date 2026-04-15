// dto/verify-image.dto.ts
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VerifyImageDto {
  @IsBoolean()
  @IsNotEmpty()
  isVerified: boolean;
}