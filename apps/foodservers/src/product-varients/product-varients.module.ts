import { Module } from '@nestjs/common';
import { ProductVarientsController } from './controller/product-varients.controller';
import { ProductVariantService } from './services/services.service';
import { ProductVariantResolver } from './resolver/resolver.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductVariant, ProductVariantSchema } from './schema/product-variant.schema';

@Module({
  controllers: [ProductVarientsController],
    imports: [
      MongooseModule.forFeature(
        [
          {
            name: ProductVariant.name,
            schema: ProductVariantSchema, // ✅ CORRECT
          },
        ],
        'restraurentconnection', // ✅ connection name
      ),
    ],
    providers: [
      ProductVariantService,   // ✅ REQUIRED
      ProductVariantResolver,  // ✅ REQUIRED
    ],
    exports: [ProductVariantService],
})
export class ProductVarientsModule {}
