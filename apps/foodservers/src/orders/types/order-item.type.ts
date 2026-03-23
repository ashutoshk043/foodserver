import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class OrderItemType {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  orderId: string;

  @Field(() => ID)
  productId: string;

  @Field(() => ID)
  variantId: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  price: number;
}