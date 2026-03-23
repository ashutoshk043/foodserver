import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { OffersServiceService } from '../offers-service/offers-service.service';
import { PaginatedOffers } from '../types/paginated-offers.type';
import { OffersType } from '../types/offers.type';
import { CreateOffersInput } from '../dtos/create-offers.input';
import { UpdateOffersInput } from '../dtos/update-offers.input';

@Resolver()
export class OffersResolverResolver {
  constructor(private readonly service: OffersServiceService) {}

  @Query(() => PaginatedOffers)
  async getOffers(
    @Args('page',   { type: () => Int,    defaultValue: 1  }) page:   number,
    @Args('limit',  { type: () => Int,    defaultValue: 10 }) limit:  number,
    @Args('search', { type: () => String, defaultValue: '' }) search: string,
  ): Promise<PaginatedOffers> {
    return this.service.findAll(page, limit, search);
  }

  @Mutation(() => OffersType)
  async createOffer(@Args('input') input: CreateOffersInput) {
    return this.service.create(input);
  }

  @Mutation(() => OffersType)
  async updateOffer(@Args('input') input: UpdateOffersInput) {
    return this.service.update(input);
  }

  @Mutation(() => Boolean)
  async deleteOffer(@Args('id') id: string): Promise<boolean> {
    return this.service.remove(id);
  }
}