import { Test, TestingModule } from '@nestjs/testing';
import { RetaurentIngredientStockServiceService } from './retaurent-ingredient-stock-service.service';

describe('RetaurentIngredientStockServiceService', () => {
  let service: RetaurentIngredientStockServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetaurentIngredientStockServiceService],
    }).compile();

    service = module.get<RetaurentIngredientStockServiceService>(RetaurentIngredientStockServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
