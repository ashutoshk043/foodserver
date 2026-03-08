import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Document, Types } from 'mongoose';
import { VariantSize } from '../enums/variant-size.enum';
import { ProductLite } from './product-lite.schema';

export type ProductVariantDocument = ProductVariant & Document;

@ObjectType()
@Schema({
  timestamps: true,
  versionKey: false,
})
export class ProductVariant {

  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  @Prop({
    type: Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  })
  productId: Types.ObjectId;

  // 🔥 ADD THIS
  @Field(() => ProductLite, { nullable: true })
  product?: ProductLite;

  @Field(() => VariantSize)
  @Prop({
    type: String,
    enum: VariantSize,
    required: true,
    trim: true,
  })
  size: VariantSize;

  @Field()
  @Prop({
    type: Boolean,
    default: true,
    index: true,
  })
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

export const ProductVariantSchema =
  SchemaFactory.createForClass(ProductVariant);

ProductVariantSchema.index(
  { productId: 1, size: 1 },
  { unique: true },
);

ProductVariantSchema.index({ productId: 1, isActive: 1 });