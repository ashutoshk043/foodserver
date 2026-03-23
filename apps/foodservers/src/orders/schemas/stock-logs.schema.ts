import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StockLogsDocument = StockLogs & Document;

export enum StockLogReason {
  ORDER      = 'ORDER',
  MANUAL_ADD = 'MANUAL_ADD',
  MANUAL_SUB = 'MANUAL_SUB',
  WASTAGE    = 'WASTAGE',
  RETURN     = 'RETURN',
}

@Schema({ timestamps: true })
export class StockLogs {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Ingredient', required: true })
  ingredientId: Types.ObjectId;

  @Prop({ required: true })
  changeQty: number; // negative = deduction, positive = addition

  @Prop({ required: true, enum: StockLogReason })
  reason: string;

  @Prop({ type: Types.ObjectId, required: false })
  referenceId?: Types.ObjectId; // orderId

  @Prop({ required: false })
  note?: string;
}

export const StockLogsSchema = SchemaFactory.createForClass(StockLogs);