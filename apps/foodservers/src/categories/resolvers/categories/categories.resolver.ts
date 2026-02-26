import { Resolver, Mutation, Args, Query, ID } from '@nestjs/graphql';
import { CategoryService } from '../../services/category/category.service';
import { Category } from '../../types/category.type';
import { CategoryInput } from '../../dtos/category.input';

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


  @Query(() => [Category])
  categories() {
    return this.categoryService.getCategories();
  }


  @Query(() => [Category],{name:'includedCategories'})
  getIncludedCategories() {
    return this.categoryService.getIncludedCategories();
  }




}
