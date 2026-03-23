import { Test, TestingModule } from '@nestjs/testing';
import { RetaurentIngredientStockControllerController } from './retaurent-ingredient-stock-controller.controller';

describe('RetaurentIngredientStockControllerController', () => {
  let controller: RetaurentIngredientStockControllerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RetaurentIngredientStockControllerController],
    }).compile();

    controller = module.get<RetaurentIngredientStockControllerController>(RetaurentIngredientStockControllerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
