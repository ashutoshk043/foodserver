import { Module } from '@nestjs/common';
import { RestaurentVarientPriceServiceService } from './restaurent-varient-price-service/restaurent-varient-price-service.service';

@Module({
  providers: [ RestaurentVarientPriceServiceService]
})
export class RestaurantVariantPriceModule {}
