// product-variant-list.response.ts

import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ProductVariant } from '../schema/product-variant.schema';

@ObjectType()
export class ProductVariantListResponse {
  @Field(() => [ProductVariant])
  data: ProductVariant[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}