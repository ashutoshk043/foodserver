import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrdersDocument = Orders & Document;

export enum OrderType {
  POS      = 'POS',
  ONLINE   = 'ONLINE',
  DELIVERY = 'DELIVERY',
  TAKEAWAY = 'TAKEAWAY',
}

export enum OrderStatus {
  PENDING   = 'PENDING',
  ACCEPTED  = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY     = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMode {
  CASH   = 'CASH',
  CARD   = 'CARD',
  UPI    = 'UPI',
  ONLINE = 'ONLINE',
}

@Schema({ timestamps: true })
export class Orders {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true, enum: OrderType })
  orderType: string;

  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.PENDING })
  status: string;

  @Prop({ required: true, default: 0 })
  subTotal: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ required: true, default: 0 })
  grandTotal: number;

  @Prop({ required: true, enum: PaymentMode })
  paymentMode: string;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const OrdersSchema = SchemaFactory.createForClass(Orders);