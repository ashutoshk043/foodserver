import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Product {

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  // ✅ ObjectId reference
  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  })
  categoryId: Types.ObjectId;

  @Prop()
  description?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ type: [String], default: [] })
  varients: string[];

  @Prop({ default: true })
  isVeg: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: true })
  isOnlineVisible: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export type ProductDocument = Product &
  Document & {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  };

export const ProductSchema = SchemaFactory.createForClass(Product);