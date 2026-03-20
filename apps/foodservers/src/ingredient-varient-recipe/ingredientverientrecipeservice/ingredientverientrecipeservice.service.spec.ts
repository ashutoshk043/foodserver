import { Test, TestingModule } from '@nestjs/testing';
import { IngredientverientrecipeserviceService } from './ingredientverientrecipeservice.service';

describe('IngredientverientrecipeserviceService', () => {
  let service: IngredientverientrecipeserviceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IngredientverientrecipeserviceService],
    }).compile();

    service = module.get<IngredientverientrecipeserviceService>(IngredientverientrecipeserviceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
