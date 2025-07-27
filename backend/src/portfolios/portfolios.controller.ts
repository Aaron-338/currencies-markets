import { Controller, Get, Post, Body, Param, Delete, Put, NotFoundException } from '@nestjs/common';
import { PortfoliosService } from './portfolios.service.js';
import { Portfolio } from './portfolio.entity.js';

@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Post()
  create(@Body() portfolio: Portfolio): Promise<Portfolio> {
    return this.portfoliosService.create(portfolio);
  }

  @Get()
  findAll(): Promise<Portfolio[]> {
    return this.portfoliosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Portfolio> {
    const portfolio = await this.portfoliosService.findOne(id);
    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID ${id} not found.`);
    }
    return portfolio;
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updatedPortfolio: Partial<Portfolio>): Promise<Portfolio> {
    return this.portfoliosService.update(id, updatedPortfolio);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.portfoliosService.remove(id);
  }
} 