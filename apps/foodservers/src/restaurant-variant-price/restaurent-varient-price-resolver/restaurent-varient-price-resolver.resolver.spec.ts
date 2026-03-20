import { Test, TestingModule } from '@nestjs/testing';
import { RestaurentVarientPriceResolverResolver } from './restaurent-varient-price-resolver.resolver';

describe('RestaurentVarientPriceResolverResolver', () => {
  let resolver: RestaurentVarientPriceResolverResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RestaurentVarientPriceResolverResolver],
    }).compile();

    resolver = module.get<RestaurentVarientPriceResolverResolver>(RestaurentVarientPriceResolverResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
