// import { Resolver, Mutation, Args, ID, Int, Query } from '@nestjs/graphql';
// import { ProductVariantService } from '../services/services.service';
// import { ProductVariantType } from '../types/product-variant.type';
// import { CreateProductVariantInput } from '../dtos/create-product-variant.input';
// import { ProductVariantListResponse } from '../types/product-variant-list.response';

// @Resolver(() => ProductVariantType)
// export class ProductVariantResolver {
//   constructor(private readonly service: ProductVariantService) {}

//   @Mutation(() => ProductVariantType)
//   addProductVariant(
//     @Args('input') input: CreateProductVariantInput,
//   ) {
//     return this.service.addProductVariant(input);
//   }

//   @Mutation(() => ProductVariantType)
//   updateProductVariant(
//     @Args('_id', { type: () => ID }) _id: string,
//     @Args('input') input: CreateProductVariantInput,
//   ) {
//     return this.service.updateProductVariant(_id, input);
//   }

//   @Query(() => [ProductVariantType])
//   async getProductVariants() {
//     return this.service.getProductVariants();
//   }
// }

import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ProductVariantType } from '../types/product-variant.type';
import { ProductVariantListResponse } from '../types/product-variant-list.response';
import { GetVariantsInput } from '../dtos/get-variants.input';
import { CreateProductVariantInput } from '../dtos/create-product-variant.input';
import { UpdateProductVariantInput } from '../dtos/update-product-variant.input';
import { ProductVariantService } from '../services/services.service';

@Resolver()
export class ProductVariantResolver {
  constructor(private readonly service: ProductVariantService) {}

  @Query(() => ProductVariantListResponse)
  async getProductVariants(
    @Args('input', { nullable: true }) input: GetVariantsInput = {},
  ): Promise<ProductVariantListResponse> {
    return this.service.getProductVariants(input);
  }

  @Mutation(() => ProductVariantType)
  async createProductVariant(
    @Args('input') input: CreateProductVariantInput,
  ): Promise<ProductVariantType> {
    return this.service.createProductVariant(input);
  }

  @Mutation(() => ProductVariantType)
  async updateProductVariant(
    @Args('input') input: UpdateProductVariantInput,
  ): Promise<ProductVariantType> {
    return this.service.updateProductVariant(input);
  }

  @Mutation(() => Boolean)
  async deleteProductVariant(
    @Args('id', { type: () => String }) id: string,
  ): Promise<boolean> {
    return this.service.deleteProductVariant(id);
  }
}