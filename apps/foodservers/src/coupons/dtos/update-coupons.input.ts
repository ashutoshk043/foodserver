import { InputType, Field, Float, Int, ID } from '@nestjs/graphql';

@InputType()
export class UpdateCouponsInput {
  @Field(() => ID)
  _id: string;

  @Field(() => ID, { nullable: true })
  restaurantId?: string;

  @Field({ nullable: true })
  code?: string;

  @Field({ nullable: true })
  discountType?: string;

  @Field(() => Float, { nullable: true })
  discountValue?: number;

  @Field(() => Float, { nullable: true })
  minOrderValue?: number;

  @Field(() => Int, { nullable: true })
  usageLimitPerUser?: number;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  expiryDate?: Date;
}