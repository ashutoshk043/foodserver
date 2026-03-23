import { InputType, Field, Float, ID } from '@nestjs/graphql';

// ── Cart item sent from frontend ─────────────────────────
@InputType()
export class OrderItemInput {
  @Field(() => ID)
  productId: string;

  @Field(() => ID)
  variantId: string;

  @Field(() => Float)
  price: number;

  @Field()
  quantity: number;
}

@InputType()
export class CreateOrdersInput {
  @Field(() => ID)
  restaurantId: string;

  @Field()
  orderType: string;

  @Field({ defaultValue: 'ACCEPTED' })
  status: string;

  // ✅ items from cart
  @Field(() => [OrderItemInput])
  items: OrderItemInput[];

  @Field(() => Float, { defaultValue: 0 })
  discount: number;

  @Field()
  paymentMode: string;

  // subTotal + grandTotal calculated server-side from items
}