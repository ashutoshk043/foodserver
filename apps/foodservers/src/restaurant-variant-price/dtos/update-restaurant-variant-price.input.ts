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

  // ✅ nullable so old records can be updated without these
  @Field(() => Float, { nullable: true })
  mrp?: number;

  // @Field(() => Float, { nullable: true })
  // actualSellingPrice?: number;

  @Field({ nullable: true })
  isAvailable?: boolean;
}