import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RestaurantImageDocument = RestaurantImage & Document;

export enum ImageType {
  LOGO    = 'LOGO',
  BANNER  = 'BANNER',
  PRODUCT = 'PRODUCT',   // ← add
  GALLERY = 'GALLERY',   // ← add
}

@Schema({ timestamps: true })
export class RestaurantImage {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', default: null, index: true })
  restaurantId: Types.ObjectId | null;

@Prop({ type: String, enum: ImageType, required: true, index: true })
filetype: ImageType;

  @Prop({ type: String, required: true })
  url: string;

  @Prop({ type: String, required: true })
  key: string;

  @Prop({ type: String, default: '' })
  imageName: string;

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;

  @Prop({ type: Boolean, default: false })
  isGlobal: boolean;

  @Prop({ type: Boolean, default: false, index: true })
  isDeleted: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  verifiedBy: Types.ObjectId | null;
}

export const RestaurantImageSchema = SchemaFactory.createForClass(RestaurantImage);

// Index for fast lookup — not unique, a restaurant can have multiple images per type
RestaurantImageSchema.index({ restaurantId: 1, filetype: 1, isDeleted: 1 }, { sparse: true });