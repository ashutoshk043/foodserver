import { ObjectType, Field, Int } from '@nestjs/graphql';
import { RecipeType } from './recipe.type';

@ObjectType()
export class PaginatedRecipes {
  @Field(() => [RecipeType])
  data: RecipeType[];

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