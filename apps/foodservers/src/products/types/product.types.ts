import { ObjectType, Field, Float, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class ProductType {

  @Field(() => ID)
  _id: string;

  @Field()
  productId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  category: string;

  @Field()
  variant: string;

  @Field()
  price: number;

  @Field()
  stock: number;

  @Field()
  status: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => ID)
  restaurantName: string;
}
