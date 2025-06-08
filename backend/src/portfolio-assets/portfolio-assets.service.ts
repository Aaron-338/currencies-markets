import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortfolioAsset } from './portfolio-asset.entity';

@Injectable()
export class PortfolioAssetsService {
  constructor(
    @InjectRepository(PortfolioAsset)
    private portfolioAssetsRepository: Repository<PortfolioAsset>,
  ) {}

  findAll(): Promise<PortfolioAsset[]> {
    return this.portfolioAssetsRepository.find();
  }

  async findOne(portfolioId: number, assetId: number): Promise<PortfolioAsset> {
    const portfolioAsset = await this.portfolioAssetsRepository.findOneBy({ portfolioId, assetId });
    if (!portfolioAsset) {
      throw new NotFoundException(`PortfolioAsset with Portfolio ID ${portfolioId} and Asset ID ${assetId} not found.`);
    }
    return portfolioAsset;
  }

  create(portfolioAsset: PortfolioAsset): Promise<PortfolioAsset> {
    return this.portfolioAssetsRepository.save(portfolioAsset);
  }

  async remove(portfolioId: number, assetId: number): Promise<void> {
    const result = await this.portfolioAssetsRepository.delete({ portfolioId, assetId });
    if (result.affected === 0) {
      throw new NotFoundException(`PortfolioAsset with Portfolio ID ${portfolioId} and Asset ID ${assetId} not found.`);
    }
  }

  async update(
    portfolioId: number,
    assetId: number,
    updatedPortfolioAsset: Partial<PortfolioAsset>,
  ): Promise<PortfolioAsset> {
    await this.portfolioAssetsRepository.update({ portfolioId, assetId }, updatedPortfolioAsset);
    return this.findOne(portfolioId, assetId);
  }
} 