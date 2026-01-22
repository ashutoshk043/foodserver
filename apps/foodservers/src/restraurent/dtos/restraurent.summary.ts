import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class RestaurantSummary {
  @Field(() => Int)
  totalRestaurants: number;

  @Field(() => Int)
  openCount: number;

  @Field(() => Int)
  closedCount: number;
}
