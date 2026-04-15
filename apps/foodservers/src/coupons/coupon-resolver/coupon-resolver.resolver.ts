import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { CouponServiceService } from '../coupon-service/coupon-service.service';
import { PaginatedCoupons } from '../types/paginated-coupons.type';
import { CouponsType } from '../types/coupons.type';
import { CreateCouponsInput } from '../dtos/create-coupons.input';
import { UpdateCouponsInput } from '../dtos/update-coupons.input';

@Resolver()
export class CouponResolverResolver {
  constructor(private readonly service: CouponServiceService) {}

  @Query(() => PaginatedCoupons)
  async getCoupons(
    @Context() ctx,
    @Args('page',   { type: () => Int,    defaultValue: 1  }) page:   number,
    @Args('limit',  { type: () => Int,    defaultValue: 10 }) limit:  number,
    @Args('search', { type: () => String, defaultValue: '' }) search: string,
  ): Promise<PaginatedCoupons> {
    return this.service.findAll(page, limit, search,ctx.user);
  }

  @Mutation(() => CouponsType)
  async createCoupon(@Args('input') input: CreateCouponsInput) {
    return this.service.create(input);
  }

  @Mutation(() => CouponsType)
  async updateCoupon(@Args('input') input: UpdateCouponsInput) {
    return this.service.update(input);
  }

  @Mutation(() => Boolean)
  async deleteCoupon(@Args('id') id: string): Promise<boolean> {
    return this.service.remove(id);
  }
}
