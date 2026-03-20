import { Test, TestingModule } from '@nestjs/testing';
import { RestaurentVarientPriceControllerController } from './restaurent-varient-price-controller.controller';

describe('RestaurentVarientPriceControllerController', () => {
  let controller: RestaurentVarientPriceControllerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurentVarientPriceControllerController],
    }).compile();

    controller = module.get<RestaurentVarientPriceControllerController>(RestaurentVarientPriceControllerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
