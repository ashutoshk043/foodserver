import { Test, TestingModule } from '@nestjs/testing';
import { CouponServiceService } from './coupon-service.service';

describe('CouponServiceService', () => {
  let service: CouponServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CouponServiceService],
    }).compile();

    service = module.get<CouponServiceService>(CouponServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
