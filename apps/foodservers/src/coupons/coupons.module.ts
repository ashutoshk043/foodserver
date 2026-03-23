import { Module } from '@nestjs/common';
import { CouponServiceService } from './coupon-service/coupon-service.service';
import { CouponResolverResolver } from './coupon-resolver/coupon-resolver.resolver';
import { CouponComponentController } from './coupon-component/coupon-component.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupons, CouponsSchema } from './schemas/coupons.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Coupons.name, schema: CouponsSchema }],
      'restraurentconnection',
    ),
  ],
  providers: [CouponServiceService, CouponResolverResolver],
  controllers: [CouponComponentController]
})
export class CouponsModule {}
