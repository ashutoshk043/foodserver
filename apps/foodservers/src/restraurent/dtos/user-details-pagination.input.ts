import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UserDetailsPaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 20 })
  limit: number;

  // email search (partial allowed)
  @Field({ nullable: true })
  search?: string;
}