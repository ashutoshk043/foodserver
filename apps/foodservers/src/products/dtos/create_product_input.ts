// dto/create-product.input.ts
import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsPositive, Min } from 'class-validator';

@InputType()
export class CreateProductInput {

  // 🔹 Required
  @Field()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsNotEmpty()
  restaurantName:string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field()
  @IsNotEmpty()
  category: string;

  @Field()
  @IsNotEmpty()
  variant: string;

  @Field(() => Float)
  @IsPositive()
  price: number;

  @Field(() => Int)
  @Min(0)
  stock: number;

  // 🔹 Optional
  @Field({ nullable: true })
  @IsOptional()
  imageUrl?: string;
}
