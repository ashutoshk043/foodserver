import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
    enum: ['FOOD', 'DRINK', 'OTHER'],
  })
  categoryType: string;

  @Prop({
    type: [String],
    enum: ['POS', 'ONLINE'],
    default: [],
  })
  displaySections: string[];

  @Prop({
    type: [String],
    enum: ['TRENDING', 'BESTSELLER', 'NEW'],
    default: [],
  })
  badges: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: true })
  isOnlineVisible: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);