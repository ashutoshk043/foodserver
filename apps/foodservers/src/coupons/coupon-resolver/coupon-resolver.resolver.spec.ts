import { Test, TestingModule } from '@nestjs/testing';
import { CouponResolverResolver } from './coupon-resolver.resolver';

describe('CouponResolverResolver', () => {
  let resolver: CouponResolverResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CouponResolverResolver],
    }).compile();

    resolver = module.get<CouponResolverResolver>(CouponResolverResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
