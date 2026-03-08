import { Resolver, Mutation, Args, Query, ID, Int } from '@nestjs/graphql';
import { CategoryService } from '../../services/category/category.service';
import { Category } from '../../types/category.type';
import { CategoryInput } from '../../dtos/category.input';
import { CategoryPagination } from '../../types/category-pagination.types';

@Resolver(() => Category)
export class CategoryResolver {

  constructor(private categoryService: CategoryService) { }

@Mutation(() => Category)
createCategory(@Args('input') input: CategoryInput) {
  return this.categoryService.createCategory(input);
}

  @Mutation(() => Category)
  updateCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: CategoryInput
  ) {
    return this.categoryService.updateCategory(id, input);
  }


  // @Query(() => [Category])
  // categories() {
  //   return this.categoryService.getCategories();
  // }


@Mutation(() => Category, { name: 'deleteCategory' })
deleteCategory(
  @Args('id', { type: () => ID }) id: string,
) {
  return this.categoryService.deleteCategory(id);
}

@Query(() => CategoryPagination, { name: 'includedCategoriesPaginated' })
async getIncludedCategoriesPaginated(
  @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
  @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  @Args('search', { nullable: true }) search?: string,
) {
  return this.categoryService.getIncludedCategoriesPaginated(page, limit, search);
}


}