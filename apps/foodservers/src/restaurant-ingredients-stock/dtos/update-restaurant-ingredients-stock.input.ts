import { InputType, Field, Float, ID } from '@nestjs/graphql';

@InputType()
export class UpdateRestaurantIngredientsStockInput {
  @Field(() => ID)
  _id: string;

  @Field(() => ID, { nullable: true })
  restaurantId?: string;

  @Field(() => ID, { nullable: true })
  ingredientId?: string;

  @Field(() => Float, { nullable: true })
  availableQty?: number;

  @Field(() => Float, { nullable: true })
  alertLevel?: number;
}