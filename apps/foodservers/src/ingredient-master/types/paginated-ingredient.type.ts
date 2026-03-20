import { ObjectType, Field, Int } from '@nestjs/graphql';
import { IngredientType } from './ingredient.type';

@ObjectType()
export class PaginatedIngredients {
  @Field(() => [IngredientType])
  data: IngredientType[];

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