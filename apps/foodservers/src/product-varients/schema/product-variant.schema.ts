import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Document, Types } from 'mongoose';
import { Transform } from 'class-transformer';
import { ProductLite } from './product-lite.schema';

export type ProductVariantDocument = ProductVariant & Document;

@ObjectType()
@Schema({ timestamps: true, versionKey: false })
export class ProductVariant {

  @Field(() => ID)
  @Transform(({ value }) => value?.toString())
  _id: string;

  @Field(() => ID)                          // GQL sees string
  @Prop({
    type: Types.ObjectId,                   // MongoDB stores ObjectId
    ref: 'Product',
    required: true,
    index: true,
  })
  @Transform(({ value }) => value?.toString())
  productId: Types.ObjectId;               // TS type stays ObjectId

  @Field(() => ProductLite, { nullable: true })
  product?: ProductLite;

  @Field(() => String)
  @Prop({ type: String, required: true, trim: true })
  size: string;

  @Field(() => Boolean)
  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);
ProductVariantSchema.index({ productId: 1, size: 1 }, { unique: true });
ProductVariantSchema.index({ productId: 1, isActive: 1 });