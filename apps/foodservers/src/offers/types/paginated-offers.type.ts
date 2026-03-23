import { ObjectType, Field, Int } from '@nestjs/graphql';
import { OffersType } from './offers.type';

@ObjectType()
export class PaginatedOffers {
  @Field(() => [OffersType])
  data: OffersType[];

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