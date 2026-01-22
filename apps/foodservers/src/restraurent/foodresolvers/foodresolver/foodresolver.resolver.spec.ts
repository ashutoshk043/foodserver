import { Test, TestingModule } from '@nestjs/testing';
import { FoodresolverResolver } from './foodresolver.resolver';

describe('FoodresolverResolver', () => {
  let resolver: FoodresolverResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FoodresolverResolver],
    }).compile();

    resolver = module.get<FoodresolverResolver>(FoodresolverResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
