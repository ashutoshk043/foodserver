import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GrpcClientsModule } from '../grpc/clients/grpc.clients'
import { AddEditProductsService } from './services/add-edit-products/add-edit-products.service';
import { ProductResolver } from './resolvers/product/product.resolver';
import { Product, ProductSchema } from './schemas/product_schema';
import { Restaurant, RestaurantSchema } from '../restraurent/schemas/restraurent.model';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Restaurant.name, schema: RestaurantSchema },
      { name: Product.name, schema: ProductSchema }
      ],
      'restraurentconnection',
    ),

    GrpcClientsModule,
  ],
  providers: [AddEditProductsService, ProductResolver],
  exports: [ProductResolver]
})
export class ProductsModule { }
