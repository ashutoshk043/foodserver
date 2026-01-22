import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type ProductDocument = Product & Document;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Product {

  // 🔥 optional but useful (external reference)
  @Prop({
    default: () => uuidv4(),
    index: true,
  })
  productId: string;

  @Prop({
    required: true,
    trim: true,
    index: true,
  })
  name: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ trim: true, index: true })
  category: string;

  @Prop({
    required: true,
    trim: true,
    index: true,
  })
  variant: string;

  @Prop({
    required: true,
    min: 0,
  })
  price: number;

  @Prop({
    required: true,
    min: 0,
  })
  stock: number;

  @Prop({
    enum: ['Available', 'Unavailable', 'OutOfStock'],
    default: 'Available',
    index: true,
  })
  status: string;

  @Prop()
  imageUrl: string;

  // 🔥 restaurant reference
  @Prop({
    type: Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true,
  })
  restaurantName: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index(
  { restaurantName: 1, name: 1, variant: 1 },
  { unique: true },
);
