import { ObjectType, Field, Int } from '@nestjs/graphql';
import { RestaurantVariantPriceType } from './restaurant-variant-price.type';

@ObjectType()
export class PaginatedRestaurantVariantPrices {
  @Field(() => [RestaurantVariantPriceType])
  data: RestaurantVariantPriceType[];

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