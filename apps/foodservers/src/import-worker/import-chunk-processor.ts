import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Job } from 'bull';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

import { Product, ProductDocument } from '../products/schemas/product_schema';
import {
  ImportSummary,
  ImportSummaryDocument,
} from '../products/schemas/import-schema';
import { ImportGateway } from '../socket/product_import.gateway';

@Processor('product-import')
export class ImportChunkProcessor {
  private readonly logger = new Logger(ImportChunkProcessor.name);

  constructor(
    @InjectModel(Product.name, 'restraurentconnection')
    private readonly productModel: Model<ProductDocument>,

    @InjectModel(ImportSummary.name, 'restraurentconnection')
    private readonly importSummaryModel: Model<ImportSummaryDocument>,

    private readonly importGateway: ImportGateway,
  ) {}

  /* =====================================
     IMPORT CHUNK HANDLER
  ====================================== */
  @Process('IMPORT_CHUNK')
  async handleChunk(job: Job) {
    const { chunk, importId, summaryId } = job.data;

    let insertedCount = 0;
    const failedRows: any[] = [];
    const docs: Partial<ProductDocument>[] = [];

    for (const row of chunk) {
      try {
        // ===== BASIC VALIDATION =====
        if (!row.name) throw new Error('Name missing');
        if (!row.categoryName) throw new Error('categoryName missing');

        docs.push({
          name: row.name,
          slug: row.name.toLowerCase().replace(/\s+/g, '-'),
          categoryId: row.categoryName, // ✅ STRING (NO ObjectId)
          description: row.description || '',
          imageUrl: row.imageUrl || '',
          tags: row.tags ? row.tags.split('|') : [],
          isVeg: row.isVeg === 'true',
          isActive: row.isActive === 'true',
          isOnlineVisible: row.isOnlineVisible === 'true',
        });
      } catch (err) {
        failedRows.push({
          ...row,
          Reason: (err as Error).message,
        });
      }
    }

    /* =====================================
       INSERT TO DB
    ====================================== */
    if (docs.length) {
      try {
        const result = await this.productModel.insertMany(docs, {
          ordered: false,
        });
        insertedCount = result.length;
      } catch (err: any) {
        insertedCount = err.insertedDocs?.length || 0;

        // HANDLE DUPLICATES
        if (Array.isArray(err.writeErrors)) {
          for (const we of err.writeErrors) {
            const d = docs[we.index];
            failedRows.push({
              name: d.name,
              categoryId: d.categoryId,
              Reason: 'Duplicate product',
            });
          }
        }
      }
    }

    /* =====================================
       WRITE FAILED CSV
    ====================================== */
    if (failedRows.length) {
      const failedDir = path.join(
        process.cwd(),
        'uploads',
        'failedImports',
      );

      if (!fs.existsSync(failedDir)) {
        fs.mkdirSync(failedDir, { recursive: true });
      }

      const failedFilePath = path.join(
        failedDir,
        `${importId}-failed.csv`,
      );

      const csvWriter = createObjectCsvWriter({
        path: failedFilePath,
        header: Object.keys(failedRows[0]).map((k) => ({
          id: k,
          title: k,
        })),
        append: fs.existsSync(failedFilePath),
      });

      await csvWriter.writeRecords(failedRows);
    }

    /* =====================================
       UPDATE SUMMARY
    ====================================== */
    await this.importSummaryModel.updateOne(
      { _id: summaryId },
      {
        $inc: {
          importedCount: insertedCount,
          failedCount: failedRows.length,
        },
      },
    );

    const summary = await this.importSummaryModel.findById(summaryId);
    if (!summary) return;

    this.importGateway.sendProgress(
      importId,
      summary.importedCount,
      summary.failedCount,
      summary.totalRecords,
      'PROCESSING',
    );

    /* =====================================
       FINAL STATUS
    ====================================== */
    if (
      summary.importedCount + summary.failedCount ===
      summary.totalRecords
    ) {
      const status =
        summary.failedCount === 0
          ? 'COMPLETED'
          : summary.importedCount === 0
          ? 'FAILED'
          : 'PARTIAL';

      await this.importSummaryModel.updateOne(
        { _id: summaryId },
        { $set: { status } },
      );

      this.importGateway.sendProgress(
        importId,
        summary.importedCount,
        summary.failedCount,
        summary.totalRecords,
        status,
      );
    }
  }
}