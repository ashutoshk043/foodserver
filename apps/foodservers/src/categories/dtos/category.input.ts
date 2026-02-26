import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CategoryInput {

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
  categoryType: string; // FOOD | DRINK | OTHER

  @Field(() => [String])
  displaySections: string[]; // POS | ONLINE

  @Field(() => [String], { nullable: true })
  badges?: string[]; // TRENDING | BESTSELLER | NEW

  @Field()
  isActive: boolean;

  @Field()
  isOnlineVisible: boolean;
}