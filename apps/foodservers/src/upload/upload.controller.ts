import {
  Controller,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import Busboy from 'busboy';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
  ) {}

  /**
   * POST /upload/import
   * Receives CSV file from frontend (Angular)
   * Saves file to disk using streaming
   * Triggers background import job
   */
  @Post('import')
  async uploadCsv(@Req() req: Request, @Res() res: Response) {
    // Initialize busboy with request headers
    const busboy = Busboy({ headers: req.headers });

    // Directory where uploaded files will be stored
    const uploadDir = path.join(process.cwd(), 'uploads');

    // Create uploads directory if not exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Unique import ID (used for tracking import progress)
    const importId = uuidv4();

    // Will store final file path
    let savedFilePath = '';

    /**
     * Fired when file stream is received
     */
    busboy.on('file', (fieldName, file, fileInfo) => {
      const originalFilename = fileInfo.filename;

      // Create unique filename to avoid conflicts
      const filename = `${importId}-${originalFilename}`;

      savedFilePath = path.join(uploadDir, filename);

      // Create write stream
      const writeStream = fs.createWriteStream(savedFilePath);

      // Pipe incoming file stream directly to disk
      file.pipe(writeStream);

      // Handle stream errors
      file.on('error', (err) => {
        console.error('File stream error:', err);
      });
    });

    /**
     * Fired when all fields & files are processed
     */
    busboy.on('finish', async () => {
      // Push background import job
      await this.uploadService.pushImportJob({
        importId,
        filePath: savedFilePath,
      });

      // Send response to frontend
      return res.status(200).json({
        success: true,
        importId,
        message: 'File uploaded successfully. Import started.',
      });
    });

    // Start streaming request into busboy
    req.pipe(busboy);
  }
}