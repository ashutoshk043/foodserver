import { Test, TestingModule } from '@nestjs/testing';
import { IngredientverientrecipecontrollerController } from './ingredientverientrecipecontroller.controller';

describe('IngredientverientrecipecontrollerController', () => {
  let controller: IngredientverientrecipecontrollerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientverientrecipecontrollerController],
    }).compile();

    controller = module.get<IngredientverientrecipecontrollerController>(IngredientverientrecipecontrollerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
