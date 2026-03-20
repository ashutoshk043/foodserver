import { Test, TestingModule } from '@nestjs/testing';
import { IngredientconrollerController } from './ingredientconroller.controller';

describe('IngredientconrollerController', () => {
  let controller: IngredientconrollerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientconrollerController],
    }).compile();

    controller = module.get<IngredientconrollerController>(IngredientconrollerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
