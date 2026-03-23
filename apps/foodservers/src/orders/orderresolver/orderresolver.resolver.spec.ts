import { Test, TestingModule } from '@nestjs/testing';
import { OrderresolverResolver } from './orderresolver.resolver';

describe('OrderresolverResolver', () => {
  let resolver: OrderresolverResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderresolverResolver],
    }).compile();

    resolver = module.get<OrderresolverResolver>(OrderresolverResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
