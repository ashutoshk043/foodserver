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

// 🔍 Search + filtering
CategorySchema.index({ name: 1 });
CategorySchema.index({ slug: 1 }, { unique: true });

// ⚡ Active + visibility filters
CategorySchema.index({ isActive: 1, isDeleted: 1 });
CategorySchema.index({ isOnlineVisible: 1 });

// 📊 Sorting / priority
CategorySchema.index({ order: 1, priority: -1 });

// 🎯 Section based filtering (POS / ONLINE)
CategorySchema.index({ displaySections: 1 });

// 🚀 Combined (most used query)
CategorySchema.index({
  isActive: 1,
  isDeleted: 1,
  isOnlineVisible: 1,
});