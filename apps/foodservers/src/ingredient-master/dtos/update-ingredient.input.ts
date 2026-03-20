import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateIngredientInput {
  @Field()
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  unit?: string;
}