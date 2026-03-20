import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class CategoryDetails {

  @Field(() => ID)
  id: string;

  @Field()
  name: string;

}

@ObjectType()
export class ProductType {

  @Field(() => ID)
  _id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  // GraphQL me ID best practice
  @Field(() => ID)
  categoryId: string;

  // populated relation
  @Field(() => CategoryDetails, { nullable: true })
  category?: CategoryDetails;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => [String], { nullable: true })
  varients?: string[];

  @Field({ nullable: true })
  isVeg?: boolean;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  isOnlineVisible?: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

}