import { InputType, Field, Float, ID } from '@nestjs/graphql';

@InputType()
export class CreateRestaurantVariantPriceInput {
  @Field(() => ID)
  restaurantId: string;

  @Field(() => ID)
  variantId: string;

  @Field(() => Float)
  price: number;

  @Field({ defaultValue: true })
  isAvailable: boolean;
}