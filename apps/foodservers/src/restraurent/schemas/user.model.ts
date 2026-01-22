import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserDetails {
  @Field()
  email: string;

  @Field()
  id:string;
}