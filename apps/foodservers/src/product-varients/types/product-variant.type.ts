import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ProductRefType } from './product-ref.type';

@ObjectType()
export class ProductVariantType {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  productId: string;                        // always string at GQL layer

  @Field(() => ProductRefType, { nullable: true })
  product?: ProductRefType;

  @Field(() => String)
  size: string;

  @Field(() => Boolean)
  isActive: boolean;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}