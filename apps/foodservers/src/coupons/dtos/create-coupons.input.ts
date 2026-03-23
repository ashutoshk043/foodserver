import { InputType, Field, Float, Int, ID } from '@nestjs/graphql';

@InputType()
export class CreateCouponsInput {
  @Field(() => ID)
  restaurantId: string;

  @Field()
  code: string;

  @Field()
  discountType: string;

  @Field(() => Float)
  discountValue: number;

  @Field(() => Float, { defaultValue: 0 })
  minOrderValue: number;

  @Field(() => Int, { defaultValue: 1 })
  usageLimitPerUser: number;

  @Field({ defaultValue: true })
  isActive: boolean;

  @Field()
  expiryDate: Date;
}