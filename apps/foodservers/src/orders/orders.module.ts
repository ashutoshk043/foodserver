import { Module } from '@nestjs/common';
import { OrderserviceService } from './orderservice/orderservice.service';
import { OrderresolverResolver } from './orderresolver/orderresolver.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Orders, OrdersSchema } from './schemas/orders.schema';
import { RestaurantIngredientsStock, RestaurantIngredientsStockSchema } from '../restaurant-ingredients-stock/schemas/restaurant-ingredients-stock.schema';
import { Recipe, RecipeSchema } from '../ingredient-varient-recipe/schemas/recipe.schema';
import { OrderItems, OrderItemsSchema } from './schemas/order-items.schema';
import { StockLogs, StockLogsSchema } from './schemas/stock-logs.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Orders.name,      schema: OrdersSchema      },
        { name: OrderItems.name,  schema: OrderItemsSchema  },
        { name: StockLogs.name,   schema: StockLogsSchema   },
        // ✅ Register Recipe model with exact class name
        { name: Recipe.name,      schema: RecipeSchema      },
        // ✅ Register Stock model
        {
          name:   RestaurantIngredientsStock.name,
          schema: RestaurantIngredientsStockSchema,
        },
      ],
      'restraurentconnection',
    ),
  ],

  providers: [OrderserviceService, OrderresolverResolver]
})
export class OrdersModule {}
