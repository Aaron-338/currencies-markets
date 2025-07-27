import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Portfolio } from './portfolio.entity.js';
import { PortfoliosService } from './portfolios.service.js';
import { PortfoliosController } from './portfolios.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Portfolio]),
  ],
  providers: [PortfoliosService],
  controllers: [PortfoliosController],
})
export class PortfoliosModule {}