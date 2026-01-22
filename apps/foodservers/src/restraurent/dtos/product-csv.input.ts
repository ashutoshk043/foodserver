// product-csv.input.ts
import { InputType, Field, Float, Int } from '@nestjs/graphql';

@InputType()
export class ProductCSVInput {
  @Field() Name: string;
  @Field() Description: string;
  @Field() Category: string;
  @Field() Variant: string;
  @Field(() => Float) Price: number;
  @Field() Stock: string;
  @Field() Status: string;
  @Field() ImageUrl: string;
  @Field() RestaurantName: string;
}
