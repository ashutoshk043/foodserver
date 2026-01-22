import { Test, TestingModule } from '@nestjs/testing';
import { RestraurentService } from './restraurent.service';

describe('RestraurentService', () => {
  let service: RestraurentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RestraurentService],
    }).compile();

    service = module.get<RestraurentService>(RestraurentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
