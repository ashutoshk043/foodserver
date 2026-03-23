import { Test, TestingModule } from '@nestjs/testing';
import { OrderserviceService } from './orderservice.service';

describe('OrderserviceService', () => {
  let service: OrderserviceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderserviceService],
    }).compile();

    service = module.get<OrderserviceService>(OrderserviceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
