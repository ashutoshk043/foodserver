import { InputType, Field, Float, ID } from '@nestjs/graphql';

@InputType()
export class UpdateOffersInput {
  @Field(() => ID)
  _id: string;

  @Field(() => ID, { nullable: true })
  restaurantId?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  type?: string;

  @Field(() => [ID], { nullable: true })
  productIds?: string[];

  @Field({ nullable: true })
  discountType?: string;

  @Field(() => Float, { nullable: true })
  discountValue?: number;

  @Field(() => Float, { nullable: true })
  minOrderValue?: number;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  startAt?: Date;

  @Field({ nullable: true })
  endAt?: Date;
}