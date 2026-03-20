import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class IngredientType {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;

  @Field()
  unit: string;

  @Field()
  isActive: boolean;

  @Field({ nullable: true })
  isDeleted: boolean;  // ← add karo

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}