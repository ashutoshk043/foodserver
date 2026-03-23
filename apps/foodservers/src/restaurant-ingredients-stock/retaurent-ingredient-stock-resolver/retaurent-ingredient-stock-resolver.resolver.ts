import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PaginatedRestaurantIngredientsStock } from '../types/paginated-restaurant-ingredients-stock.type';
import { RestaurantIngredientsStockType } from '../types/restaurant-ingredients-stock.type';
import { CreateRestaurantIngredientsStockInput } from '../dtos/create-restaurant-ingredients-stock.input';
import { UpdateRestaurantIngredientsStockInput } from '../dtos/update-restaurant-ingredients-stock.input';
import { RestaurantIngredientsStockService } from '../retaurent-ingredient-stock-service/retaurent-ingredient-stock-service.service';

@Resolver()
export class RestaurantIngredientsStockResolver {
  constructor(private readonly service: RestaurantIngredientsStockService) {}

  @Query(() => PaginatedRestaurantIngredientsStock)
  async getRestaurantIngredientsStocks(
    @Args('page',   { type: () => Int,    defaultValue: 1  }) page:   number,
    @Args('limit',  { type: () => Int,    defaultValue: 10 }) limit:  number,
    @Args('search', { type: () => String, defaultValue: '' }) search: string,
  ): Promise<PaginatedRestaurantIngredientsStock> {
    return this.service.findAll(page, limit, search);
  }

  @Mutation(() => RestaurantIngredientsStockType)
  async createRestaurantIngredientsStock(
    @Args('input') input: CreateRestaurantIngredientsStockInput,
  ) {
    return this.service.create(input);
  }

  @Mutation(() => RestaurantIngredientsStockType)
  async updateRestaurantIngredientsStock(
    @Args('input') input: UpdateRestaurantIngredientsStockInput,
  ) {
    return this.service.update(input);
  }

  @Mutation(() => Boolean)
  async deleteRestaurantIngredientsStock(
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.service.remove(id);
  }
}