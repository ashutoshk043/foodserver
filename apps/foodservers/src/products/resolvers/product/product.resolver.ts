import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProductType } from '../../types/product.types';
import { CreateProductInput } from '../../dtos/create_product_input';
import { AddEditProductsService } from '../../services/add-edit-products/add-edit-products.service';

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


  @Query(() => [ProductType])
  async searchProducts(
    @Args('name', { nullable: true }) name?: string,
    @Args('category', { nullable: true }) category?: string,
  ): Promise<ProductType[]> {
    return this.productService.searchProducts({ name, category });
  }


  @Mutation(() => ProductType)
  async deleteProduct(
    @Args('_id') _id: string,
  ): Promise<ProductType> {
    return this.productService.deleteProduct(_id);
  }


}
