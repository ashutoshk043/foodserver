import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class ProductLite {

  @Field(() => ID)
  _id: string;

  @Field()
  name: string;
}