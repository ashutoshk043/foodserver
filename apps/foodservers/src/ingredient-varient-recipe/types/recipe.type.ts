import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class RecipeType {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  variantId: string;

  @Field()
  variantSize: string;

  @Field(() => ID)
  productId: string;

  @Field()
  productName: string;

  @Field(() => ID)
  categoryId: string;

  @Field()
  categoryName: string;

  @Field(() => ID)
  ingredientId: string;

  @Field()
  ingredientName: string;

  @Field()
  unit: string;

  @Field(() => Float)
  quantity: number;
}