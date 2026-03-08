import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Category } from './category.type';

@ObjectType()
export class CategoryPagination {

  @Field(() => [Category])
  data: Category[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  limit: number;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPrevPage: boolean;
}