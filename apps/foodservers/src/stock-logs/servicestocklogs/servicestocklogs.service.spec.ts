import { Test, TestingModule } from '@nestjs/testing';
import { ServicestocklogsService } from './servicestocklogs.service';

describe('ServicestocklogsService', () => {
  let service: ServicestocklogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicestocklogsService],
    }).compile();

    service = module.get<ServicestocklogsService>(ServicestocklogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
