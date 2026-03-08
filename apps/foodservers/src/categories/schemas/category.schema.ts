import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/* ================= ENUMS ================= */

export enum CategoryType {
  FOOD = 'FOOD',
  DRINK = 'DRINK',
  OTHER = 'OTHER',
}

export enum DisplaySection {
  POS = 'POS',
  ONLINE = 'ONLINE',
}

export enum CategoryBadge {
  TRENDING = 'TRENDING',
  BESTSELLER = 'BESTSELLER',
  NEW = 'NEW',
}

/* ================= SCHEMA ================= */

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Category extends Document {

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  slug: string;

  @Prop({ default: null })
  imageUrl?: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: 0 })
  priority: number;

  @Prop({
    required: true,
    enum: CategoryType,
  })
  categoryType: CategoryType;

  @Prop({
    type: [String],
    enum: DisplaySection,
    default: [],
  })
  displaySections: DisplaySection[];

  @Prop({
    type: [String],
    enum: CategoryBadge,
    default: [],
  })
  badges: CategoryBadge[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: true })
  isOnlineVisible: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

/* ================= INDEX ================= */

CategorySchema.index({ name: 1 });