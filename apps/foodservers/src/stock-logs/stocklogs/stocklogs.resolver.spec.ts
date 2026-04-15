import { Test, TestingModule } from '@nestjs/testing';
import { StocklogsResolver } from './stocklogs.resolver';

describe('StocklogsResolver', () => {
  let resolver: StocklogsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StocklogsResolver],
    }).compile();

    resolver = module.get<StocklogsResolver>(StocklogsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
