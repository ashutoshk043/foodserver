import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class ProductRefType {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;
}