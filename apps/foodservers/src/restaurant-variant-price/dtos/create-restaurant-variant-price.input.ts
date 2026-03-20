import { InputType, Field, Float, ID } from '@nestjs/graphql';

@InputType()
export class CreateRestaurantVariantPriceInput {
  @Field(() => ID)
  restaurantId: string;

  @Field(() => ID)
  variantId: string;

  @Field(() => Float)
  price: number;

  // ✅ New fields
  @Field(() => Float)
  mrp: number;

  // @Field(() => Float)
  // actualSellingPrice: number;

  @Field({ defaultValue: true })
  isAvailable: boolean;
}