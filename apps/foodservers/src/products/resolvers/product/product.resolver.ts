import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProductType } from '../../types/product.types';
import { CreateProductInput } from '../../dtos/create_product_input';
import { AddEditProductsService } from '../../services/add-edit-products/add-edit-products.service';
import { ProductPaginationType } from '../../types/product-pagination';

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
  @Args('category', { nullable: true }) category?: string,
  @Args('page', { type: () => Int, defaultValue: 1 }) page?: number,
  @Args('limit', { type: () => Int, defaultValue: 10 }) limit?: number,
  @Context() ctx?: any
) {
  const user = ctx.req.user; // injected by auth guard

  return this.productService.searchProducts({
    name,
    category,
    page,
    limit,
    user
  });
}




  @Mutation(() => ProductType)
  async deleteProduct(
    @Args('_id') _id: string,
  ): Promise<ProductType> {
    return this.productService.deleteProduct(_id);
  }


}
