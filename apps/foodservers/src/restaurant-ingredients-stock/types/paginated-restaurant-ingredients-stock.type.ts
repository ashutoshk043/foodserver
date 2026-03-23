import { ObjectType, Field, Int } from '@nestjs/graphql';
import { RestaurantIngredientsStockType } from './restaurant-ingredients-stock.type';

@ObjectType()
export class PaginatedRestaurantIngredientsStock {
  @Field(() => [RestaurantIngredientsStockType])
  data: RestaurantIngredientsStockType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPrevPage: boolean;
}