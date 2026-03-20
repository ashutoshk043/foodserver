import { Test, TestingModule } from '@nestjs/testing';
import { RestaurentVarientPriceServiceService } from './restaurent-varient-price-service.service';

describe('RestaurentVarientPriceServiceService', () => {
  let service: RestaurentVarientPriceServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RestaurentVarientPriceServiceService],
    }).compile();

    service = module.get<RestaurentVarientPriceServiceService>(RestaurentVarientPriceServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
