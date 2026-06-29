import { Controller, Get, Post, Body, Param, Delete, Put, NotFoundException } from '@nestjs/common';
import { PortfolioAssetsService } from './portfolio-assets.service';
import { PortfolioAsset } from './portfolio-asset.entity';

@Controller('portfolio-assets')
export class PortfolioAssetsController {
  constructor(private readonly portfolioAssetsService: PortfolioAssetsService) {}

  @Post()
  create(@Body() portfolioAsset: PortfolioAsset): Promise<PortfolioAsset> {
    return this.portfolioAssetsService.create(portfolioAsset);
  }

  @Get()
  findAll(): Promise<PortfolioAsset[]> {
    return this.portfolioAssetsService.findAll();
  }

  @Get(':portfolioId/:assetId')
  async findOne(
    @Param('portfolioId') portfolioId: number,
    @Param('assetId') assetId: number,
  ): Promise<PortfolioAsset> {
    const portfolioAsset = await this.portfolioAssetsService.findOne(portfolioId, assetId);
    if (!portfolioAsset) {
      throw new NotFoundException(`PortfolioAsset with Portfolio ID ${portfolioId} and Asset ID ${assetId} not found.`);
    }
    return portfolioAsset;
  }

  @Put(':portfolioId/:assetId')
  update(
    @Param('portfolioId') portfolioId: number,
    @Param('assetId') assetId: number,
    @Body() updatedPortfolioAsset: Partial<PortfolioAsset>,
  ): Promise<PortfolioAsset> {
    return this.portfolioAssetsService.update(portfolioId, assetId, updatedPortfolioAsset);
  }

  @Delete(':portfolioId/:assetId')
  remove(
    @Param('portfolioId') portfolioId: number,
    @Param('assetId') assetId: number,
  ): Promise<void> {
    return this.portfolioAssetsService.remove(portfolioId, assetId);
  }
}