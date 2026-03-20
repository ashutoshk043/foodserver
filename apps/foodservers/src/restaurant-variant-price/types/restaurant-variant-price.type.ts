import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class RestaurantVariantPriceType {
  @Field(() => ID)
  _id: string;

  // ── Flat fields from aggregation ──
  @Field(() => ID)
  restaurantId: string;

  @Field()
  restaurantName: string;

  @Field(() => ID)
  variantId: string;

  @Field()
  variantSize: string;

  @Field(() => ID)
  productId: string;

  @Field()
  productName: string;

  @Field(() => Float)
  price: number;

  @Field()
  isAvailable: boolean;

  @Field({ nullable: true })
  createdAt?: Date;
}