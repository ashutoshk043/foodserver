import { InputType, Field, Float, ID } from '@nestjs/graphql';
import { OrderItemInput } from './create-orders.input';

@InputType()
export class UpdateOrdersInput {
  @Field(() => ID)
  _id: string;

  @Field({ nullable: true })
  status?: string;

  @Field(() => Float, { nullable: true })
  discount?: number;

  @Field({ nullable: true })
  paymentMode?: string;

  // ✅ Optional — send only when items changed
  @Field(() => [OrderItemInput], { nullable: true })
  items?: OrderItemInput[];

  // Internal — calculated server side, not from client
  subTotal?:   number;
  grandTotal?: number;
}