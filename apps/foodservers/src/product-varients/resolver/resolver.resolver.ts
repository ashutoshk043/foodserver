
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