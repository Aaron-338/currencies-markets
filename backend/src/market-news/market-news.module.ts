import { Module } from '@nestjs/common';
import { MarketNewsController } from './market-news.controller.js';
import { NewsApiService } from './news-api.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [MarketNewsController],
  providers: [NewsApiService],
  exports: [NewsApiService],
})
export class MarketNewsModule {} 