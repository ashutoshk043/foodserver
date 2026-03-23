import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { OrderserviceService } from '../orderservice/orderservice.service';
import { PaginatedOrders } from '../types/paginated-orders.type';
import { OrdersType } from '../types/orders.type';
import { CreateOrdersInput } from '../dtos/create-orders.input';
import { UpdateOrdersInput } from '../dtos/update-orders.input';

@Resolver()
export class OrderresolverResolver {
 constructor(private readonly service: OrderserviceService) {}

  @Query(() => PaginatedOrders)
  async getOrders(
    @Args('page',   { type: () => Int,    defaultValue: 1  }) page:   number,
    @Args('limit',  { type: () => Int,    defaultValue: 10 }) limit:  number,
    @Args('search', { type: () => String, defaultValue: '' }) search: string,
  ): Promise<PaginatedOrders> {
    return this.service.findAll(page, limit, search);
  }

  @Mutation(() => OrdersType)
  async createOrder(@Args('input') input: CreateOrdersInput) {
    return this.service.create(input);
  }

  @Mutation(() => OrdersType)
  async updateOrder(@Args('input') input: UpdateOrdersInput) {
    return this.service.update(input);
  }

  @Mutation(() => Boolean)
  async deleteOrder(@Args('id') id: string): Promise<boolean> {
    return this.service.remove(id);
  }
}