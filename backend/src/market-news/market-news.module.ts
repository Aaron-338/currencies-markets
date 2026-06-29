import { Module } from '@nestjs/common';
import { MarketNewsController } from './market-news.controller';
import { NewsApiService } from './news-api.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MarketNewsController],
  providers: [NewsApiService],
  exports: [NewsApiService],
})
export class MarketNewsModule {} 