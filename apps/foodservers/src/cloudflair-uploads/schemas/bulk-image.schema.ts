import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type productImageDocument = productImage & Document;

export enum ImageType {
  LOGO    = 'LOGO',
  BANNER  = 'BANNER',
  PRODUCT = 'PRODUCT',
  GALLERY = 'GALLERY',
}

@Schema({ timestamps: true })
export class productImage {
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

export const productImageSchema = SchemaFactory.createForClass(productImage);

productImageSchema.index({ restaurantId: 1, filetype: 1, isDeleted: 1 }, { sparse: true });