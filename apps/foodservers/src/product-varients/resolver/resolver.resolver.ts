import { Resolver, Mutation, Args, ID, Int, Query } from '@nestjs/graphql';
import { ProductVariantService } from '../services/services.service';
import { ProductVariantType } from '../types/product-variant.type';
import { CreateProductVariantInput } from '../dtos/create-product-variant.input';
import { ProductVariantListResponse } from '../types/product-variant-list.response';

@Resolver(() => ProductVariantType)
export class ProductVariantResolver {
  constructor(private readonly service: ProductVariantService) {}

  @Mutation(() => ProductVariantType)
  addProductVariant(
    @Args('input') input: CreateProductVariantInput,
  ) {
    return this.service.addProductVariant(input);
  }

  @Mutation(() => ProductVariantType)
  updateProductVariant(
    @Args('_id', { type: () => ID }) _id: string,
    @Args('input') input: CreateProductVariantInput,
  ) {
    return this.service.updateProductVariant(_id, input);
  }

@Query(() => ProductVariantListResponse)
getProductVariants(
  @Args('productId', { nullable: true }) productId?: string,

  @Args('size', { nullable: true }) size?: string,

  @Args('page', { type: () => Int, defaultValue: 1 }) page?: number,

  @Args('limit', { type: () => Int, defaultValue: 10 }) limit?: number,
) {
  return this.service.getProductVariants(
    productId,
    size,
    page,
    limit,
  );
}
}