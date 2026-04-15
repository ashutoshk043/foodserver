// dto/stock-log-response.type.ts
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class IngredientInfo {
  @Field() _id: string;
  @Field() name: string;
  @Field() unit: string;
}

@ObjectType()
export class RestaurantInfo {
  @Field() _id: string;
  @Field() name: string;
}

@ObjectType()
export class StockLogItem {
  @Field() _id: string;
  @Field({ nullable: true }) orderNumber?: string;
  @Field() reason: string;
  @Field(() => Float) changeQty: number;
  @Field() changeLabel: string;
  @Field({ nullable: true }) note?: string;
  @Field() createdAt: Date;
  @Field(() => IngredientInfo) ingredient: IngredientInfo;
  @Field(() => RestaurantInfo, { nullable: true }) restaurant?: RestaurantInfo;
}

@ObjectType()
export class StockLogsMeta {
  @Field(() => Int) total: number;
  @Field(() => Int) page: number;
  @Field(() => Int) limit: number;
  @Field(() => Int) totalPages: number;
  @Field() hasNextPage: boolean;
  @Field() hasPrevPage: boolean;
}

@ObjectType()
export class StockLogsResponse {
  @Field(() => [StockLogItem]) docs: StockLogItem[];
  @Field(() => StockLogsMeta) meta: StockLogsMeta;
}