import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class RvpVariantRef {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;

  @Field(() => ID)
  productId: string;
}

@ObjectType()
export class RvpProductRef {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;
}

@ObjectType()
export class RvpRestaurantRef {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;
}

@ObjectType()
export class RestaurantVariantPriceType {
  @Field(() => ID)
  _id: string;

  @Field(() => Float)
  price: number;

  // ✅ nullable — old docs won't have these fields
  @Field(() => Float, { nullable: true })
  mrp?: number;

  // @Field(() => Float, { nullable: true })
  // actualSellingPrice?: number;

  @Field()
  isAvailable: boolean;

  @Field(() => RvpVariantRef)
  variant: RvpVariantRef;

  @Field(() => RvpProductRef)
  product: RvpProductRef;

  @Field(() => RvpRestaurantRef)
  restaurant: RvpRestaurantRef;
}