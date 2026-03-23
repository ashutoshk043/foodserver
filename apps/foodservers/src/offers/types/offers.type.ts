import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class OffersRestaurantRef {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;
}

@ObjectType()
export class OffersType {
  @Field(() => ID)
  _id: string;

  @Field()
  title: string;

  @Field()
  type: string;

  @Field(() => [String], { defaultValue: [] })
  productIds: string[];

  @Field()
  discountType: string;

  @Field(() => Float)
  discountValue: number;

  @Field(() => Float, { nullable: true })
  minOrderValue?: number;

  @Field()
  isActive: boolean;

  @Field()
  startAt: Date;

  @Field()
  endAt: Date;

  @Field(() => OffersRestaurantRef)
  restaurant: OffersRestaurantRef;

  @Field({ nullable: true })
  createdAt?: Date;
}