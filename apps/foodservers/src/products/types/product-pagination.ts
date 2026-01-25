import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ProductType } from './product.types';

@ObjectType()
export class ProductPaginationType {
  @Field(() => [ProductType])
  data: ProductType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
