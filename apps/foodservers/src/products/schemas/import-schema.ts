import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ImportSummaryDocument = ImportSummary & Document;

@Schema({ timestamps: true })
export class ImportSummary {
  // 🔑 MOST IMPORTANT
  @Prop({ required: true, unique: true, index: true })
  importId: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true, default: 0 })
  totalRecords: number;

  @Prop({ default: 0 })
  importedCount: number;

  @Prop({ default: 0 })
  failedCount: number;

  @Prop()
  failedFilePath?: string;

  @Prop({
    enum: ['PROCESSING', 'COMPLETED', 'PARTIAL', 'FAILED'],
    default: 'PROCESSING',
  })
  status: 'PROCESSING' | 'COMPLETED' | 'PARTIAL' | 'FAILED';
}

export const ImportSummarySchema =
  SchemaFactory.createForClass(ImportSummary);
