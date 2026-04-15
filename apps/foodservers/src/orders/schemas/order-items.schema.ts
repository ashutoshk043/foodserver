import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderItemsDocument = OrderItems & Document;

@Schema({ timestamps: true })
export class OrderItems {
  @Prop({ type: Types.ObjectId, ref: 'Orders', required: true })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ProductVariant', required: true })
  variantId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop({ type: String, index: true })
orderNumber: string;
}

export const OrderItemsSchema = SchemaFactory.createForClass(OrderItems);