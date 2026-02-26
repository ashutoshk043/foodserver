import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  categoryId: string;

  @Prop()
  description?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: true })
  isVeg: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: true })
  isOnlineVisible: boolean;
}

export type ProductDocument = Product &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };

export const ProductSchema = SchemaFactory.createForClass(Product);