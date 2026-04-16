import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Product {

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  // ✅ Category reference
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

  // 🔥 NEW: Global vs Restaurant
  @Prop({ default: false, index: true })
  isGlobal: boolean;

  // 🔥 NEW: Restaurant reference (nullable)
  @Prop({
    type: Types.ObjectId,
    ref: 'Restaurant',
    default: null,
    index: true
  })
  restaurantId?: Types.ObjectId | null;
}

export type ProductDocument = Product &
  Document & {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  };

export const ProductSchema = SchemaFactory.createForClass(Product);


// 🔍 Basic search
ProductSchema.index({ name: 1 });
ProductSchema.index({ slug: 1 }, { unique: true });

// ⚡ Category filtering
ProductSchema.index({ categoryId: 1 });

// 🥗 Filters
ProductSchema.index({ isVeg: 1 });
ProductSchema.index({ isOnlineVisible: 1 });

// 🔥 Active + soft delete (common filter)
ProductSchema.index({ isActive: 1, isDeleted: 1 });

// 🚀 MULTI-TENANT CORE QUERY INDEX (MOST IMPORTANT)
ProductSchema.index({
  categoryId: 1,
  isActive: 1,
  isDeleted: 1,
  isOnlineVisible: 1,
  isGlobal: 1,
  restaurantId: 1,
});