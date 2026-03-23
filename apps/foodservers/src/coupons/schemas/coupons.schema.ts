import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CouponsDocument = Coupons & Document;

export enum CouponDiscountType {
  PERCENT = 'PERCENT',
  FLAT    = 'FLAT',
}

@Schema({ timestamps: true })
export class Coupons {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, enum: CouponDiscountType })
  discountType: string;

  @Prop({ required: true })
  discountValue: number;

  @Prop({ default: 0 })
  minOrderValue: number;

  @Prop({ default: 1 })
  usageLimitPerUser: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true })
  expiryDate: Date;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const CouponsSchema = SchemaFactory.createForClass(Coupons);