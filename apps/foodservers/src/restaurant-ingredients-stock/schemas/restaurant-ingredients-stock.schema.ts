import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RestaurantIngredientsStockDocument = RestaurantIngredientsStock & Document;

@Schema({ timestamps: true })
export class RestaurantIngredientsStock {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Ingredient', required: true })
  ingredientId: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  availableQty: number;

  @Prop({ required: true, default: 0 })
  alertLevel: number;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const RestaurantIngredientsStockSchema =
  SchemaFactory.createForClass(RestaurantIngredientsStock);