import { Test, TestingModule } from '@nestjs/testing';
import { RetaurentIngredientStockResolverResolver } from './retaurent-ingredient-stock-resolver.resolver';

describe('RetaurentIngredientStockResolverResolver', () => {
  let resolver: RetaurentIngredientStockResolverResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetaurentIngredientStockResolverResolver],
    }).compile();

    resolver = module.get<RetaurentIngredientStockResolverResolver>(RetaurentIngredientStockResolverResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
