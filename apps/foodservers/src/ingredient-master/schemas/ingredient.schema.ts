import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IngredientDocument = Ingredient & Document;

@Schema({ timestamps: true })
export class Ingredient {
  @Prop({ required: true, trim: true, unique: true })  // ← unique: true add karo
  name: string;

  @Prop({
    required: true,
    enum: ['PCS', 'GRAM', 'KG', 'ML', 'LITER'],
  })
  unit: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;  // ← add karo
}

export const IngredientSchema = SchemaFactory.createForClass(Ingredient);