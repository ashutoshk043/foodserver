import { Test, TestingModule } from '@nestjs/testing';
import { ProductVarientsController } from './product-varients.controller';

describe('ProductVarientsController', () => {
  let controller: ProductVarientsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductVarientsController],
    }).compile();

    controller = module.get<ProductVarientsController>(ProductVarientsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
