import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { RecipeService } from '../ingredientverientrecipeservice/ingredientverientrecipeservice.service';
import { RecipeType } from '../types/recipe.type';
import { PaginatedRecipes } from '../types/paginated-recipe.type';
import { CreateRecipeInput } from '../dtos/create-recipe.input';
import { UpdateRecipeInput } from '../dtos/update-recipe.input';

@Resolver(() => RecipeType)
export class RecipeResolver {
  constructor(private readonly recipeService: RecipeService) {}

  @Mutation(() => RecipeType)
  async createRecipe(@Args('input') input: CreateRecipeInput): Promise<RecipeType> {
    return this.recipeService.create(input) as any;
  }

  @Mutation(() => RecipeType)
  async updateRecipe(@Args('input') input: UpdateRecipeInput): Promise<RecipeType> {
    return this.recipeService.update(input) as any;
  }

  @Mutation(() => RecipeType)
  async deleteRecipe(@Args('id') id: string): Promise<RecipeType> {
    return this.recipeService.remove(id) as any;
  }

  @Query(() => PaginatedRecipes)
  async getRecipes(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('search', { type: () => String, defaultValue: '' }) search: string,
  ): Promise<PaginatedRecipes> {
    return this.recipeService.findAll(page, limit, search);
  }

  @Query(() => [RecipeType])
  async getRecipesByVariant(@Args('variantId') variantId: string): Promise<RecipeType[]> {
    return this.recipeService.findByVariant(variantId) as any;
  }

  @Query(() => RecipeType)
  async getRecipe(@Args('id') id: string): Promise<RecipeType> {
    return this.recipeService.findOne(id) as any;
  }
}