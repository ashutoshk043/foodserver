import { Test, TestingModule } from '@nestjs/testing';
import { OffersServiceService } from './offers-service.service';

describe('OffersServiceService', () => {
  let service: OffersServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OffersServiceService],
    }).compile();

    service = module.get<OffersServiceService>(OffersServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
