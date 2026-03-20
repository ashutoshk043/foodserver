import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RestaurantVariantPriceDocument = RestaurantVariantPrice & Document;

@Schema({ timestamps: true })
export class RestaurantVariantPrice {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ProductVariant', required: true })
  variantId: Types.ObjectId;

  @Prop({ required: true })
  price: number;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const RestaurantVariantPriceSchema =
  SchemaFactory.createForClass(RestaurantVariantPrice);