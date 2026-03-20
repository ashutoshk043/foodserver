import { Resolver } from '@nestjs/graphql';

import { IngredientService } from '../services/ingredient.service';
import { IngredientType } from '../types/ingredient.type';
import { PaginatedIngredients } from '../types/paginated-ingredient.type';
import { CreateIngredientInput } from '../dtos/create-ingredient.input';
import { UpdateIngredientInput } from '../dtos/update-ingredient.input';
import { Args, Mutation, Query, Int } from '@nestjs/graphql';
@Resolver(() => IngredientType)
export class IngredientresolverResolver {
  constructor(private readonly ingredientService: IngredientService) {}

  // ── Create ──────────────────────────────────────────────
  @Mutation(() => IngredientType)
  async createIngredient(
    @Args('input') input: CreateIngredientInput,
  ): Promise<IngredientType> {
    return this.ingredientService.create(input) as any;
  }

  // ── Update ──────────────────────────────────────────────
  @Mutation(() => IngredientType)
  async updateIngredient(
    @Args('input') input: UpdateIngredientInput,
  ): Promise<IngredientType> {
    return this.ingredientService.update(input) as any;
  }

  // ── Soft Delete ─────────────────────────────────────────
  @Mutation(() => IngredientType)
  async deleteIngredient(
    @Args('id') id: string,
  ): Promise<IngredientType> {
    return this.ingredientService.remove(id) as any;
  }

  // ── Paginated List ──────────────────────────────────────
// ingredient.resolver.ts
@Query(() => PaginatedIngredients)
async getIngredients(
  @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
  @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  @Args('search', { type: () => String, defaultValue: '' }) search: string, // ✅ add
): Promise<PaginatedIngredients> {
  return this.ingredientService.findAll(page, limit, search);
}

  // ── Single ──────────────────────────────────────────────
  @Query(() => IngredientType)
  async getIngredient(@Args('id') id: string): Promise<IngredientType> {
    return this.ingredientService.findOne(id) as any;
  }
}