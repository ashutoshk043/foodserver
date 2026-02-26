import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class ProductType {

  @Field(() => ID)
  _id: string;

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
  tags: string[];

  @Field()
  isVeg: boolean;

  @Field()
  isActive: boolean;

  @Field()
  isOnlineVisible: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}