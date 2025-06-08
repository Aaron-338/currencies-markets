import { Module } from '@nestjs/common';
import { PortfolioAssetsService } from './portfolio-assets.service';
import { PortfolioAssetsController } from './portfolio-assets.controller';

@Module({
  providers: [PortfolioAssetsService],
  controllers: [PortfolioAssetsController]
})
export class PortfolioAssetsModule {}
