import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Restraurents {
    @Field(() => ID)
    _id: string;

    @Field()
    name: string;

}