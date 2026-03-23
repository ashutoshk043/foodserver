import { Test, TestingModule } from '@nestjs/testing';
import { OffersControllerController } from './offers-controller.controller';

describe('OffersControllerController', () => {
  let controller: OffersControllerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OffersControllerController],
    }).compile();

    controller = module.get<OffersControllerController>(OffersControllerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
