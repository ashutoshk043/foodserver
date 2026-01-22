import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantInput } from '../../dtos/create_restraurent.input';
import { Restaurant } from '../../schemas/restraurent.model';
import { RestraurentService } from '../../services/restraurent/restraurent.service';
import { PaginatedUserDetails } from '../../schemas/paginated-user-details.model';
import { UserDetailsPaginationInput } from '../../dtos/user-details-pagination.input';
import { RestaurantPagination } from '../../dtos/restraurent_details_pagination';
import { RestaurantSummary } from '../../dtos/restraurent.summary';
@Resolver()
export class FoodresolverResolver {

  @Query(() => String)
  foodPing() {
    return 'Food Service OK';
  }


  constructor(private readonly restaurantService: RestraurentService) { }

  @Mutation(() => Restaurant)
  createRestaurant(
    @Args('input') input: CreateRestaurantInput,
  ) {
    return this.restaurantService.createRestaurant(input);
  }

  @Mutation(() => Restaurant)
  updateRestaurant(
    @Args('input') input: CreateRestaurantInput,
  ) {
    return this.restaurantService.updateRestaurant(input);
  }


  @Query(() => RestaurantPagination)
  restaurants(
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
    @Args('search', { type: () => String, nullable: true }) search?: string,
  ) {
    return this.restaurantService.getRestaurants(page, limit, search);
  }


  @Query(() => PaginatedUserDetails)
  usersFromAuth(
    @Args('input') input: UserDetailsPaginationInput,
  ) {
    return this.restaurantService.getUsers(input);
  }


  @Query(() => RestaurantSummary)
  getRestaurantSummary() {
    return this.restaurantService.getRestaurantSummary();
  }







}
