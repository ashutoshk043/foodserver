import { Test, TestingModule } from '@nestjs/testing';
import { AddEditProductsService } from './add-edit-products.service';

describe('AddEditProductsService', () => {
  let service: AddEditProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AddEditProductsService],
    }).compile();

    service = module.get<AddEditProductsService>(AddEditProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
