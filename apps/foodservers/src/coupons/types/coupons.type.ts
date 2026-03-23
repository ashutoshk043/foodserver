import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class CouponsRestaurantRef {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;
}

@ObjectType()
export class CouponsType {
  @Field(() => ID)
  _id: string;

  @Field()
  code: string;

  @Field()
  discountType: string;

  @Field(() => Float)
  discountValue: number;

  @Field(() => Float, { nullable: true })
  minOrderValue?: number;

  @Field(() => Int, { nullable: true })
  usageLimitPerUser?: number;

  @Field()
  isActive: boolean;

  @Field()
  expiryDate: Date;

  @Field(() => CouponsRestaurantRef)
  restaurant: CouponsRestaurantRef;

  @Field({ nullable: true })
  createdAt?: Date;
}