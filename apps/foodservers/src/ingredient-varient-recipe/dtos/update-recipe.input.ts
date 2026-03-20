import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

@InputType()
export class UpdateRecipeInput {
  @Field()
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  variantId?: string;

  @Field({ nullable: true })
  ingredientId?: string;

  @Field({ nullable: true })
  @IsNumber()
  @Min(0)
  quantity?: number;
}