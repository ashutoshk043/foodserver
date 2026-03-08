// create-product-variant.input.ts

import { InputType, Field, ID } from '@nestjs/graphql';
import { VariantSize } from '../enums/variant-size.enum';

@InputType()
export class CreateProductVariantInput {

  @Field(() => ID)
  productId: string;

  @Field(() => VariantSize)
  size: VariantSize;

  @Field({ defaultValue: true })
  isActive?: boolean;
}