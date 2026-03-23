import { InputType, Field, Float, ID } from '@nestjs/graphql';

@InputType()
export class CreateOffersInput {
  @Field(() => ID)
  restaurantId: string;

  @Field()
  title: string;

  @Field()
  type: string;

  @Field(() => [ID], { defaultValue: [] })
  productIds: string[];

  @Field()
  discountType: string;

  @Field(() => Float)
  discountValue: number;

  @Field(() => Float, { defaultValue: 0 })
  minOrderValue: number;

  @Field({ defaultValue: true })
  isActive: boolean;

  @Field()
  startAt: Date;

  @Field()
  endAt: Date;
}