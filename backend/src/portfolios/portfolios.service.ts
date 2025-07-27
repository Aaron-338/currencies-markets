import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio } from './portfolio.entity.js';

@Injectable()
export class PortfoliosService {
  constructor(
    @InjectRepository(Portfolio)
    private portfoliosRepository: Repository<Portfolio>,
  ) {}

  findAll(): Promise<Portfolio[]> {
    return this.portfoliosRepository.find({
      relations: ['user', 'portfolioAssets'], // Include relationships for comprehensive data
    });
  }

  async findOne(id: number): Promise<Portfolio> {
    const portfolio = await this.portfoliosRepository.findOne({
      where: { id },
      relations: ['user', 'portfolioAssets'], // Include relationships
    });
    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID ${id} not found.`);
    }
    return portfolio;
  }

  create(portfolio: Portfolio): Promise<Portfolio> {
    return this.portfoliosRepository.save(portfolio);
  }

  async remove(id: number): Promise<void> {
    const result = await this.portfoliosRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Portfolio with ID ${id} not found.`);
    }
  }

  async update(id: number, updatedPortfolio: Partial<Portfolio>): Promise<Portfolio> {
    await this.portfoliosRepository.update(id, updatedPortfolio);
    return this.findOne(id);
  }
} 