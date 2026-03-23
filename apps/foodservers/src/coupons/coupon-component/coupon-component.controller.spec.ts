import { Test, TestingModule } from '@nestjs/testing';
import { CouponComponentController } from './coupon-component.controller';

describe('CouponComponentController', () => {
  let controller: CouponComponentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponComponentController],
    }).compile();

    controller = module.get<CouponComponentController>(CouponComponentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
