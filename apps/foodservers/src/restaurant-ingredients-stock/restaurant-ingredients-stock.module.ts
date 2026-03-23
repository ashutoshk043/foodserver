import { Module } from '@nestjs/common';
import { RetaurentIngredientStockControllerController } from './retaurent-ingredient-stock-controller/retaurent-ingredient-stock-controller.controller';
import { RestaurantIngredientsStockResolver } from './retaurent-ingredient-stock-resolver/retaurent-ingredient-stock-resolver.resolver';
import { RestaurantIngredientsStockService } from './retaurent-ingredient-stock-service/retaurent-ingredient-stock-service.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantIngredientsStock, RestaurantIngredientsStockSchema } from './schemas/restaurant-ingredients-stock.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: RestaurantIngredientsStock.name, schema: RestaurantIngredientsStockSchema }],
      'restraurentconnection',
    ),
  ],
  controllers: [RetaurentIngredientStockControllerController],
  providers: [RestaurantIngredientsStockResolver, RestaurantIngredientsStockService]
})
export class RestaurantIngredientsStockModule {}
