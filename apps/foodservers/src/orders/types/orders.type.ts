import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { OrderItemType } from './order-item.type';

@ObjectType()
export class OrdersRestaurantRef {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;
}

@ObjectType()
export class OrdersType {
  @Field(() => ID)
  _id: string;

  @Field()
  orderType: string;

  @Field()
  status: string;

  @Field(() => Float)
  subTotal: number;

  @Field(() => Float, { nullable: true })
  discount?: number;

  @Field(() => Float)
  grandTotal: number;

  @Field()
  paymentMode: string;

  @Field(() => [OrderItemType], { nullable: true })
  items?: OrderItemType[];

  @Field(() => OrdersRestaurantRef)
  restaurant: OrdersRestaurantRef;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  orderNumber?: Date;

  
}