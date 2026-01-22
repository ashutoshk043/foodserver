import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Restaurant } from '../schemas/restraurent.model';

@ObjectType()
export class RestaurantPagination {

  @Field(() => [Restaurant])
  data: Restaurant[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}


