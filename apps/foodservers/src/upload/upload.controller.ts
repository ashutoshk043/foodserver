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
  constructor(private readonly uploadService: UploadService) {}

  @Post('import')
  async uploadCsv(@Req() req: Request, @Res() res: Response) {
    const busboy = Busboy({ headers: req.headers });

    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const importId = uuidv4(); // 🔥 UUID v4
    let savedFilePath = '';

    busboy.on('file', (_, file, info) => {
      const filename = `${importId}-${info.filename}`;
      savedFilePath = path.join(uploadDir, filename);

      const writeStream = fs.createWriteStream(savedFilePath);
      file.pipe(writeStream);
    });

    busboy.on('finish', async () => {
      await this.uploadService.pushImportJob({
        importId,
        filePath: savedFilePath,
      });

      return res.json({
        success: true,
        importId, // ✅ FRONTEND + SOCKET
        message: 'File uploaded & import started',
      });
    });

    req.pipe(busboy);
  }
}
