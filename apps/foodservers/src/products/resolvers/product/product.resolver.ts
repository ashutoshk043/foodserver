import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProductType } from '../../types/product.types';
import { CreateProductInput } from '../../dtos/create_product_input';
import { AddEditProductsService } from '../../services/add-edit-products/add-edit-products.service';
import { ProductPaginationType } from '../../types/product-pagination';
import { Restraurents } from '../../types/restaurant.types';

@Resolver(() => ProductType)
export class ProductResolver {

  constructor(
    private readonly productService: AddEditProductsService,
  ) { }

  @Query(() => String)
  productPing() {
    return 'Product Module is OK';
  }

  @Mutation(() => ProductType)
  async addProducts(
    @Args('input') input: CreateProductInput,
  ): Promise<ProductType> {
    return this.productService.createProduct(input);
  }


  // product.resolver.ts
  @Mutation(() => ProductType)
  async updateProduct(
    @Args('_id') _id: string,
    @Args('input') input: CreateProductInput,
  ): Promise<ProductType> {
    return this.productService.updateProduct(_id, input);
  }

  @Query(() => ProductPaginationType)
  async searchProducts(
    @Args('name', { nullable: true }) name?: string,
    @Args('categoryId', { nullable: true }) categoryId?: string,
    @Args('page', { type: () => Int, defaultValue: 1 }) page?: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit?: number,
  ) {
    return this.productService.searchProducts({
      name,
      categoryId,
      page,
      limit,
    });
  }

  @Mutation(() => ProductType)
  async deleteProduct(
    @Args('_id') _id: string,
  ): Promise<ProductType> {
    return this.productService.deleteProduct(_id);
  }


  @Query(() => [Restraurents])
  async getAllRestaurants(@Context() ctx?: any): Promise<Restraurents[]> {
    return this.productService.getAllRestaurants(ctx);
  }

}
