import { Injectable, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL_BASE } from '../r2config/r2config';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  async uploadFile(
    file: Express.Multer.File,
    type: string,
    imageName?: string,
  ) {
    // ── GUARD: file must exist and have a buffer (memoryStorage) ──
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException(
        'File buffer is empty — ensure Multer is configured with memoryStorage()',
      );
    }

    // ── GUARD: valid file extension ────────────────────────────────
    const parts = file.originalname.split('.');
    if (parts.length < 2) {
      throw new BadRequestException('File must have a valid extension');
    }
    const fileExtension = parts.pop()!.toLowerCase(); // 👈 ! tells TS it's definitely defined

    // ── GUARD: allowed extensions ──────────────────────────────────
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'];
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      throw new BadRequestException(
        `File type ".${fileExtension}" is not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
      );
    }

    try {
      const folder = type?.toUpperCase() === 'LOGO' ? 'logos' : 'banners';

      // ── sanitize imageName, fallback to uuid if result is empty ──
      const sanitized = imageName
        ? imageName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '')
        : '';
      const baseName = sanitized ? `${sanitized}-${uuid()}` : uuid();

      const key = `${folder}/${baseName}.${fileExtension}`;

      // ── strip trailing slash from base URL to avoid double-slash ─
      const baseUrl = R2_PUBLIC_URL_BASE.replace(/\/$/, '');
      const url = `${baseUrl}/${key}`;

      this.logger.log(`Uploading to R2: ${key}`);

      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await r2Client.send(command);
      this.logger.log(`Upload successful: ${url}`);

      return { key, url };
    } catch (error) {
      // re-throw validation errors as-is
      if (error instanceof BadRequestException) throw error;

      this.logger.error(`Upload failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to upload file: ${error.message}`);
    }
  }

  async deleteFile(key: string) {
    // ── GUARD: key must be a non-empty string ─────────────────────
    if (!key || typeof key !== 'string' || !key.trim()) {
      throw new BadRequestException('A valid file key is required for deletion');
    }

    try {
      this.logger.log(`Deleting from R2: ${key}`);

      const command = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key.trim(),
      });

      await r2Client.send(command);
      this.logger.log(`Delete successful: ${key}`);
    } catch (error) {
      this.logger.error(`Delete failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to delete file: ${error.message}`);
    }
  }
}