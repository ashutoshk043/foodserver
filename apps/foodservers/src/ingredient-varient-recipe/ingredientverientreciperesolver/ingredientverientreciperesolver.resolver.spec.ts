import { Test, TestingModule } from '@nestjs/testing';
import { IngredientverientreciperesolverResolver } from './ingredientverientreciperesolver.resolver';

describe('IngredientverientreciperesolverResolver', () => {
  let resolver: IngredientverientreciperesolverResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IngredientverientreciperesolverResolver],
    }).compile();

    resolver = module.get<IngredientverientreciperesolverResolver>(
      IngredientverientreciperesolverResolver,
    );
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
