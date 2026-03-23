import { Test, TestingModule } from '@nestjs/testing';
import { OffersResolverResolver } from './offers-resolver.resolver';

describe('OffersResolverResolver', () => {
  let resolver: OffersResolverResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OffersResolverResolver],
    }).compile();

    resolver = module.get<OffersResolverResolver>(OffersResolverResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
