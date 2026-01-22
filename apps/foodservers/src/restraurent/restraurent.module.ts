import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Restaurant, RestaurantSchema } from './schemas/restraurent.model';
import { RestraurentService } from './services/restraurent/restraurent.service';
import { FoodresolverResolver } from './foodresolvers/foodresolver/foodresolver.resolver';
import {GrpcClientsModule} from '../grpc/clients/grpc.clients'
import { Product, ProductSchema } from './schemas/product_schema';

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
  providers: [RestraurentService, FoodresolverResolver],
  exports: [RestraurentService]
})
export class RestraurentModule {}
