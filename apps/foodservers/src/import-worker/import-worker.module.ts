import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ImportProcessor } from './import.processor';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../products/schemas/product_schema';
import { Restaurant, RestaurantSchema } from '../restraurent/schemas/restraurent.model';
import { ImportChunkProcessor } from './import-chunk-processor';
import { ImportSummary, ImportSummarySchema } from '../products/schemas/import-schema';
import { ImportGateway } from '../socket/product_import.gateway';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'product-import', // ✅ SAME NAME
    }),
    MongooseModule.forFeature(
      [
        { name: Product.name, schema: ProductSchema },
        { name: Restaurant.name, schema: RestaurantSchema },
        { name: ImportSummary.name, schema: ImportSummarySchema }
      ],
      'restraurentconnection',
    ),
  ],
  providers: [ImportProcessor, ImportChunkProcessor, ImportGateway],
  exports: [ImportGateway]
})
export class ImportWorkerModule {}
