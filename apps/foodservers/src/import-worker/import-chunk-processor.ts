import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Job } from 'bull';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../products/schemas/product_schema';
import { Restaurant } from '../restraurent/schemas/restraurent.model';
import * as path from 'path';
import * as fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import { ImportSummary, ImportSummaryDocument } from '../products/schemas/import-schema';
import { ImportGateway } from '../socket/product_import.gateway';

@Processor('product-import')
export class ImportChunkProcessor {
  private readonly logger = new Logger(ImportChunkProcessor.name);
  private restaurantMap = new Map<string, Types.ObjectId>();

  constructor(
    @InjectModel(Product.name, 'restraurentconnection')
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Restaurant.name, 'restraurentconnection')
    private readonly restaurantModel: Model<Restaurant>,
    @InjectModel(ImportSummary.name, 'restraurentconnection')
    private readonly importSummaryModel: Model<ImportSummaryDocument>,
    private readonly importGateway: ImportGateway,
  ) { }

  private async loadRestaurants() {
    if (this.restaurantMap.size) return;
    const restaurants = await this.restaurantModel.find({}, { restaurantName: 1 });
    restaurants.forEach((r) =>
      this.restaurantMap.set(r.restaurantName.toLowerCase().trim(), r._id),
    );
  }

  @Process('IMPORT_CHUNK')
  async handleChunk(job: Job) {
    const { chunk, chunkIndex, importId, summaryId } = job.data;

    await this.loadRestaurants();

    let insertedCount = 0;
    const failedRows: any[] = [];
    const docs: Partial<ProductDocument>[] = [];

    for (const row of chunk) {
      try {
        const restaurantId = this.restaurantMap.get(row.RestaurantName?.toLowerCase()?.trim());
        if (!restaurantId) throw new Error('Invalid restaurant');

        const price = Number(row.Price);
        const stock = Number(row.Stock);
        if (isNaN(price)) throw new Error('Invalid price');
        if (isNaN(stock)) throw new Error('Invalid stock');

        docs.push({
          name: row.Name,
          description: row.Description,
          category: row.Category,
          variant: row.Variant,
          price,
          stock,
          status: row.Status,
          imageUrl: row.ImageUrl,
          restaurantName: restaurantId,
        });
      } catch (err) {
        failedRows.push({ ...row, Reason: (err as Error).message });
      }
    }

if (docs.length) {
  try {
    const result = await this.productModel.insertMany(docs, {
      ordered: false,
    });
    insertedCount = result.length;
  } catch (err: any) {
    insertedCount = err.insertedDocs?.length || 0;

    // 🔥 HANDLE DUPLICATES (E11000)
    if (err.writeErrors && Array.isArray(err.writeErrors)) {
      for (const we of err.writeErrors) {
        const failedDoc = docs[we.index];

        failedRows.push({
          Name: failedDoc.name,
          Description: failedDoc.description,
          Category: failedDoc.category,
          Variant: failedDoc.variant,
          Price: failedDoc.price,
          Stock: failedDoc.stock,
          Status: failedDoc.status,
          ImageUrl: failedDoc.imageUrl,
          RestaurantName: this.getRestaurantNameById(failedDoc.restaurantName), //failedDoc.restaurantName, // ObjectId
          Reason: 'Duplicate product (name + variant + restaurant)',
        });
      }
    }
  }
}


    // Failed CSV
    if (failedRows.length) {
      const failedDir = path.join(process.cwd(), 'uploads', 'failedImports');
      if (!fs.existsSync(failedDir)) fs.mkdirSync(failedDir, { recursive: true });

      const failedFilePath = path.join(failedDir, `${importId}-failed.csv`);
      const csvWriter = createObjectCsvWriter({
        path: failedFilePath,
        header: Object.keys(failedRows[0]).map((k) => ({ id: k, title: k })),
        append: fs.existsSync(failedFilePath),
      });
      await csvWriter.writeRecords(failedRows);
    }

    // Update summary in DB
    await this.importSummaryModel.updateOne(
      { _id: summaryId },
      { $inc: { importedCount: insertedCount, failedCount: failedRows.length } },
    );


    // 🔥 ADD SMALL DELAY (VERY IMPORTANT)
    // await this.delay(10000); // 300ms (tune 200–500ms)

    // Send progress to frontend
    // Send progress to frontend
    const summary = await this.importSummaryModel.findById(summaryId);

    if (!summary) {
      this.logger.warn(`⚠️ Summary not found for ID: ${summaryId}`);
      return; // exit if summary not found
    }

    // Now TypeScript knows summary is not null
    this.importGateway.sendProgress(
      importId,
      summary.importedCount,
      summary.failedCount,
      summary.totalRecords,
      'PROCESSING',
    );


    // Final status
    if (summary.importedCount + summary.failedCount === summary.totalRecords) {
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


  getRestaurantNameById(id: any) {
  for (const [name, rid] of this.restaurantMap.entries()) {
    if (rid.toString() === id.toString()) return name;
  }
  return 'Unknown';
}

}
