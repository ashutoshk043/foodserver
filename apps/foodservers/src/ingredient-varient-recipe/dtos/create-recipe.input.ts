import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

@InputType()
export class CreateRecipeInput {
  @Field()
  @IsNotEmpty()
  variantId: string;

  @Field()
  @IsNotEmpty()
  ingredientId: string;

  @Field()
  @IsNumber()
  @Min(0)
  quantity: number;
}