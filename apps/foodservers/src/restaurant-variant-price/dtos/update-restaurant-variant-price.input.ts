import { InputType, Field, Float, ID } from '@nestjs/graphql';

@InputType()
export class UpdateRestaurantVariantPriceInput {
  @Field(() => ID)
  _id: string;

  @Field(() => ID, { nullable: true })
  restaurantId?: string;

  @Field(() => ID, { nullable: true })
  variantId?: string;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field({ nullable: true })
  isAvailable?: boolean;
}