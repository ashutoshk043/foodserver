import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';

export const multerOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      return cb(new BadRequestException('Only image files allowed'), false);
    }
    cb(null, true);
  },
};