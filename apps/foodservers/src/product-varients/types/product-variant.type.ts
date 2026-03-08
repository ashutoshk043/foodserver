import { ObjectType, Field, ID } from '@nestjs/graphql';
import { VariantSize } from '../enums/variant-size.enum';

@ObjectType()
export class ProductVariantType {

  @Field(() => ID)
  _id: string;

  @Field()
  productId: string;

  @Field(() => VariantSize)
  size: VariantSize;

  @Field()
  isActive: boolean;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}