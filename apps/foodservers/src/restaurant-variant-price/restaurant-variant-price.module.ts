import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RestaurantVariantPrice,
  RestaurantVariantPriceSchema,
} from './schemas/restaurant-variant-price.schema';
import { RestaurantVariantPriceService } from './restaurent-varient-price-service/restaurent-varient-price-service.service';
import { RestaurantVariantPriceResolver } from './restaurent-varient-price-resolver/restaurent-varient-price-resolver.resolver';
import { GrpcClientsModule } from '../grpc/clients/grpc.clients';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: RestaurantVariantPrice.name, schema: RestaurantVariantPriceSchema }],
      'restraurentconnection', // ✅ must match @InjectModel second arg in service
    ),
    GrpcClientsModule,
  ],
  providers: [RestaurantVariantPriceService, RestaurantVariantPriceResolver],
})
export class RestaurantVariantPriceModule {}