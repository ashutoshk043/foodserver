import { Test, TestingModule } from '@nestjs/testing';
import { ServicegrpcService } from './servicegrpc.service';

describe('ServicegrpcService', () => {
  let service: ServicegrpcService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicegrpcService],
    }).compile();

    service = module.get<ServicegrpcService>(ServicegrpcService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
