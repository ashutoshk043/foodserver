import { ObjectType, Field, Int } from '@nestjs/graphql';
import { OrdersType } from './orders.type';

@ObjectType()
export class PaginatedOrders {
  @Field(() => [OrdersType])
  data: OrdersType[];

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