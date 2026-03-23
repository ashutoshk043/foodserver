import { InputType, Field, Float, ID } from '@nestjs/graphql';

@InputType()
export class CreateRestaurantIngredientsStockInput {
  @Field(() => ID)
  restaurantId: string;

  @Field(() => ID)
  ingredientId: string;

  @Field(() => Float)
  availableQty: number;

  @Field(() => Float)
  alertLevel: number;
}