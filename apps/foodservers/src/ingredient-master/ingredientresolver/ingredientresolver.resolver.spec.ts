import { Test, TestingModule } from '@nestjs/testing';
import { IngredientresolverResolver } from './ingredientresolver.resolver';

describe('IngredientresolverResolver', () => {
  let resolver: IngredientresolverResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IngredientresolverResolver],
    }).compile();

    resolver = module.get<IngredientresolverResolver>(IngredientresolverResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
