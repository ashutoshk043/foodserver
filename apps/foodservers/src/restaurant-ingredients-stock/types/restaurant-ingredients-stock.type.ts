import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class RisRestaurantRef {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;
}

@ObjectType()
export class RisIngredientRef {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  unit?: string;
}

@ObjectType()
export class RestaurantIngredientsStockType {
  @Field(() => ID)
  _id: string;

  @Field(() => Float)
  availableQty: number;

  @Field(() => Float)
  alertLevel: number;

  @Field(() => RisRestaurantRef)
  restaurant: RisRestaurantRef;

  @Field(() => RisIngredientRef)
  ingredient: RisIngredientRef;

  @Field({ nullable: true })
  createdAt?: Date;
}