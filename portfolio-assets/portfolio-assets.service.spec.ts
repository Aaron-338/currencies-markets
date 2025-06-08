import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioAssetsService } from './portfolio-assets.service';

describe('PortfolioAssetsService', () => {
  let service: PortfolioAssetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PortfolioAssetsService],
    }).compile();

    service = module.get<PortfolioAssetsService>(PortfolioAssetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
