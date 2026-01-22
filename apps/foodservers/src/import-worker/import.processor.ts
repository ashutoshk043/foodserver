import { Process, Processor, InjectQueue } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Job, Queue } from 'bull';
import * as fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { Model } from 'mongoose';
import { ImportSummary, ImportSummaryDocument } from '../products/schemas/import-schema';

@Processor('product-import')
export class ImportProcessor {
  private readonly logger = new Logger(ImportProcessor.name);

  constructor(
    @InjectQueue('product-import') private readonly queue: Queue,
    @InjectModel(ImportSummary.name, 'restraurentconnection')
    private readonly importSummaryModel: Model<ImportSummaryDocument>,
  ) {}

  @Process('IMPORT_PRODUCTS')
  async handleImport(job: Job<{ importId: string; filePath: string }>) {
    const { filePath, importId } = job.data;
    const storedFileName = path.basename(filePath);
    const originalFileName = storedFileName.replace(/^\d+-/, '');

    const CHUNK_SIZE = 1000;
    let buffer: any[] = [];
    let chunkIndex = 0;
    let totalRecords = 0;

    const summary = await this.importSummaryModel.create({
      importId:importId,
      fileName: originalFileName,
      totalRecords: 0,
      importedCount: 0,
      failedCount: 0,
      status: 'PROCESSING',
    });

    try {
      await new Promise<void>((resolve, reject) => {
        const stream = fs.createReadStream(filePath).pipe(
          csv({
            headers: [
              'Name',
              'Description',
              'Category',
              'Variant',
              'Price',
              'Stock',
              'Status',
              'ImageUrl',
              'RestaurantName',
            ],
            skipLines: 1,
            strict: false,
            separator: ',',
            mapValues: ({ value }) =>
              typeof value === 'string' ? value.trim() : value,
          }),
        );

        stream.on('data', (row) => {
          if (!row.Name || !row.RestaurantName) return;

          buffer.push(row);
          totalRecords++;

          if (buffer.length === CHUNK_SIZE) {
            stream.pause();
            chunkIndex++;

            this.queue
              .add(
                'IMPORT_CHUNK',
                { chunk: buffer, chunkIndex, importId, summaryId: summary._id.toString() },
                { attempts: 3, removeOnComplete: true },
              )
              .then(() => (buffer = []))
              .finally(() => stream.resume());
          }
        });

        stream.on('end', async () => {
          if (buffer.length) {
            chunkIndex++;
            await this.queue.add('IMPORT_CHUNK', {
              chunk: buffer,
              chunkIndex,
              importId,
              summaryId: summary._id.toString(),
            });
          }
          resolve();
        });

        stream.on('error', reject);
      });

      await this.importSummaryModel.updateOne({ _id: summary._id }, { $set: { totalRecords } });

      this.logger.log(`✅ Import started: ${originalFileName}`);
    } catch (err) {
      this.logger.error('❌ Import failed', err);
      await this.importSummaryModel.updateOne({ _id: summary._id }, { $set: { status: 'FAILED' } });
      throw err;
    } finally {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }
}
