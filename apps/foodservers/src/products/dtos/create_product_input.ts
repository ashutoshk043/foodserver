import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateProductInput {

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field()
  categoryId: string;

  @Field()
  description: string;

  @Field()
  imageUrl: string;

  @Field(() => [String])
  varients: string[];

  @Field()
  isVeg: boolean;

  @Field()
  isActive: boolean;

  @Field()
  isOnlineVisible: boolean;
}