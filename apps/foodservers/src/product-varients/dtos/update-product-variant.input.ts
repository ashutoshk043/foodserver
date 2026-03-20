import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsMongoId } from 'class-validator';

@InputType()
export class UpdateProductVariantInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsMongoId()
  _id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  size?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}