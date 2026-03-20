import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantVariantPriceResolver } from './restaurent-varient-price-resolver.resolver';

describe('RestaurantVariantPriceResolver', () => {
  let resolver: RestaurantVariantPriceResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RestaurantVariantPriceResolver],
    }).compile();

    resolver = module.get<RestaurantVariantPriceResolver>(RestaurantVariantPriceResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
