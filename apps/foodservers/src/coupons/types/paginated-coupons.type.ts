import { ObjectType, Field, Int } from '@nestjs/graphql';
import { CouponsType } from './coupons.type';

@ObjectType()
export class PaginatedCoupons {
  @Field(() => [CouponsType])
  data: CouponsType[];

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