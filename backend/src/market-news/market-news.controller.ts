import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NewsApiService, NewsArticle } from './news-api.service.js';

@Controller('market-news')
export class MarketNewsController {
  constructor(private readonly newsApiService: NewsApiService) {}

  @Get()
  async getMarketNews(
    @Query('topics') topics?: string,
    @Query('limit') limit?: string,
    @Query('_t') timestamp?: string
  ): Promise<{ success: boolean; data: NewsArticle[]; count: number }> {
    try {
      const topicsArray = topics ? topics.split(',') : ['finance', 'trading', 'stocks'];
      const forceRefresh = !!timestamp; // If timestamp is provided, it means force refresh
      const newsArticles = await this.newsApiService.fetchFinancialNews(topicsArray, forceRefresh);
      
      const limitNumber = limit ? parseInt(limit, 10) : 10;
      const limitedArticles = newsArticles.slice(0, limitNumber);

      return {
        success: true,
        data: limitedArticles,
        count: limitedArticles.length
      };
    } catch (error) {
      console.error('Error fetching market news:', error);
      return {
        success: false,
        data: [],
        count: 0
      };
    }
  }

  @Get('public')
  async getPublicMarketNews(
    @Query('topics') topics?: string,
    @Query('limit') limit?: string,
    @Query('_t') timestamp?: string
  ): Promise<{ success: boolean; data: NewsArticle[]; count: number }> {
    try {
      const topicsArray = topics ? topics.split(',') : ['finance', 'trading', 'stocks'];
      const forceRefresh = !!timestamp; // If timestamp is provided, it means force refresh
      const newsArticles = await this.newsApiService.fetchFinancialNews(topicsArray, forceRefresh);
      
      const limitNumber = limit ? parseInt(limit, 10) : 3; // Default to 3 for homepage
      const limitedArticles = newsArticles.slice(0, limitNumber);

      return {
        success: true,
        data: limitedArticles,
        count: limitedArticles.length
      };
    } catch (error) {
      console.error('Error fetching public market news:', error);
      // Return fallback data for public endpoint
      return {
        success: true,
        data: this.getFallbackNews().slice(0, parseInt(limit || '3', 10)),
        count: 3
      };
    }
  }

  @Get('latest')
  @UseGuards(AuthGuard('jwt'))
  async getLatestNews(): Promise<{ success: boolean; data: NewsArticle[]; count: number }> {
    return this.getMarketNews(undefined, '5');
  }

  @Get('categories')
  @UseGuards(AuthGuard('jwt'))
  async getNewsByCategory(
    @Query('category') category: string
  ): Promise<{ success: boolean; data: NewsArticle[]; count: number }> {
    try {
      const allNews = await this.newsApiService.fetchFinancialNews();
      const filteredNews = allNews.filter(article => 
        article.category.toLowerCase() === category.toLowerCase()
      );

      return {
        success: true,
        data: filteredNews.slice(0, 10),
        count: filteredNews.length
      };
    } catch (error) {
      console.error('Error fetching news by category:', error);
      return {
        success: false,
        data: [],
        count: 0
      };
    }
  }

  private getFallbackNews(): NewsArticle[] {
    const now = new Date();
    return [
      {
        id: 'fallback_1',
        title: 'Federal Reserve Signals Potential Policy Shift in Upcoming Meeting',
        summary: 'Federal Reserve officials have indicated they may adjust monetary policy in response to recent economic indicators, with markets closely watching for signals on interest rate direction.',
        url: '#',
        publishedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        source: 'Financial Times',
        category: 'Economy',
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
        sentiment: 'neutral'
      },
      {
        id: 'fallback_2',
        title: 'Cryptocurrency Markets Show Strong Momentum Amid Institutional Adoption',
        summary: 'Major cryptocurrencies are experiencing significant price movements as institutional investors continue to increase their digital asset allocations.',
        url: '#',
        publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        source: 'CoinDesk',
        category: 'Crypto',
        imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400',
        sentiment: 'positive'
      },
      {
        id: 'fallback_3',
        title: 'Global Oil Markets React to Geopolitical Developments',
        summary: 'Oil prices are fluctuating in response to international developments, with traders monitoring supply chain implications.',
        url: '#',
        publishedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
        source: 'Reuters',
        category: 'Commodities',
        imageUrl: 'https://images.unsplash.com/photo-1582182300890-32b4a43e3c4d?w=400',
        sentiment: 'neutral'
      }
    ];
  }
} 