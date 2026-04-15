import { Test, TestingModule } from '@nestjs/testing';
import { ServicesCloudService } from './services-cloud.service';

describe('ServicesCloudService', () => {
  let service: ServicesCloudService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicesCloudService],
    }).compile();

    service = module.get<ServicesCloudService>(ServicesCloudService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
