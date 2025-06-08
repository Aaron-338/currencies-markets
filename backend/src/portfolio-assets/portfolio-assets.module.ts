import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioAsset } from './portfolio-asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PortfolioAsset])],
})
export class PortfolioAssetsModule {} 