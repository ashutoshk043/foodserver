import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OffersDocument = Offers & Document;

export enum OfferType {
  PRODUCT  = 'PRODUCT',
  CATEGORY = 'CATEGORY',
  ORDER    = 'ORDER',
}

export enum DiscountType {
  PERCENT = 'PERCENT',
  FLAT    = 'FLAT',
}

@Schema({ timestamps: true })
export class Offers {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, enum: OfferType })
  type: string;

  @Prop({ type: [Types.ObjectId], default: [] })
  productIds: Types.ObjectId[];

  @Prop({ required: true, enum: DiscountType })
  discountType: string;

  @Prop({ required: true })
  discountValue: number;

  @Prop({ default: 0 })
  minOrderValue: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true })
  startAt: Date;

  @Prop({ required: true })
  endAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const OffersSchema = SchemaFactory.createForClass(Offers);