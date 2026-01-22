import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

export interface ImportJobPayload {
  importId: string;
  filePath: string;
}

@Injectable()
export class UploadService {
  constructor(
    @InjectQueue('product-import')
    private readonly importQueue: Queue,
  ) {}

  async pushImportJob(payload: ImportJobPayload): Promise<void> {
    await this.importQueue.add(
      'IMPORT_PRODUCTS',
      payload,
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
        removeOnComplete: true,
        removeOnFail: false, // 🔥 debugging ke liye useful
      },
    );
  }
}
