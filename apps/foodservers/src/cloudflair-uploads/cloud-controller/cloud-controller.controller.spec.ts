import { Test, TestingModule } from '@nestjs/testing';
import { CloudControllerController } from './cloud-controller.controller';

describe('CloudControllerController', () => {
  let controller: CloudControllerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CloudControllerController],
    }).compile();

    controller = module.get<CloudControllerController>(CloudControllerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
