import { Field, ObjectType, Int } from '@nestjs/graphql';
import { UserDetails } from './user.model';

@ObjectType()
export class PaginatedUserDetails {
  @Field(() => [UserDetails])
  data: UserDetails[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}