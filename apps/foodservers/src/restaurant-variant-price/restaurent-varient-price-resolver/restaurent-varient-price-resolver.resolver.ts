import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { RestaurantVariantPriceService } from '../restaurent-varient-price-service/restaurent-varient-price-service.service';
import { PaginatedRestaurantVariantPrices } from '../types/paginated-restaurant-variant-price.type';
import { RestaurantVariantPriceType } from '../types/restaurant-variant-price.type';
import { CreateRestaurantVariantPriceInput } from '../dtos/create-restaurant-variant-price.input';
import { UpdateRestaurantVariantPriceInput } from '../dtos/update-restaurant-variant-price.input';

@Resolver()
export class RestaurantVariantPriceResolver {
  constructor(private readonly service: RestaurantVariantPriceService) {}

  // ✅ Query added back — was commented out with wrong type
  @Query(() => PaginatedRestaurantVariantPrices)
  async getRestaurantVariantPrices(
    @Args('page',   { type: () => Int,    defaultValue: 1  }) page:   number,
    @Args('limit',  { type: () => Int,    defaultValue: 10 }) limit:  number,
    @Args('search', { type: () => String, defaultValue: '' }) search: string,
  ): Promise<PaginatedRestaurantVariantPrices> {
    return this.service.findAll(page, limit, search);
  }

  @Mutation(() => RestaurantVariantPriceType)
  async createRestaurantVariantPrice(
    @Args('input') input: CreateRestaurantVariantPriceInput,
  ) {
    return this.service.create(input);
  }

  @Mutation(() => RestaurantVariantPriceType)
  async updateRestaurantVariantPrice(
    @Args('input') input: UpdateRestaurantVariantPriceInput,
  ) {
    return this.service.update(input);
  }

  @Mutation(() => Boolean)
  async deleteRestaurantVariantPrice(
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.service.remove(id);
  }
}