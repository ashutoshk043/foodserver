import { ObjectType, Field, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class Category {

  @Field(() => ID)
  _id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => Int)
  order: number;

  @Field(() => Int)
  priority: number;

  @Field()
  categoryType: string;

  @Field(() => [String])
  displaySections: string[];

  @Field(() => [String], { nullable: true })
  badges?: string[];

  @Field()
  isActive: boolean;

  @Field()
  isOnlineVisible: boolean;

  // ✅ ADD THESE TWO
  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}