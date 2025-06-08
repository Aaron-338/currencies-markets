import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioAssetsController } from './portfolio-assets.controller';

describe('PortfolioAssetsController', () => {
  let controller: PortfolioAssetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioAssetsController],
    }).compile();

    controller = module.get<PortfolioAssetsController>(PortfolioAssetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
