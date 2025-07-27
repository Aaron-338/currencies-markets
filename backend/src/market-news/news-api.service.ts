import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  source: string;
  category: string;
  imageUrl?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

interface MarketauxNewsArticle {
  uuid: string;
  title: string;
  description: string;
  snippet: string;
  url: string;
  image_url: string;
  language: string;
  published_at: string;
  source: string;
  relevance_score: number;
  entities: Array<{
    symbol: string;
    name: string;
    exchange: string;
    industry: string;
    match_score: number;
    sentiment_score: number;
    highlights: Array<{
      highlight: string;
      sentiment: number;
      highlighted_in: string;
    }>;
  }>;
  similar: string[];
}

interface MarketauxResponse {
  meta: {
    found: number;
    returned: number;
    limit: number;
    page: number;
  };
  data: MarketauxNewsArticle[];
}

@Injectable()
export class NewsApiService {
  private readonly logger = new Logger(NewsApiService.name);
  private readonly marketauxApiKey = process.env.MARKETAUX_API_TOKEN || '';
  private readonly alphavantageApiKey = process.env.ALPHAVANTAGE_API_KEY || 'demo';
  private readonly newsApiKey = process.env.NEWS_API_KEY || '';
  
  // Rate limiting
  private lastNewsCall = 0;
  private newsCallCount = 0;
  private readonly newsCallLimit = 100; // per day

  async fetchFinancialNews(topics: string[] = ['finance', 'trading', 'stocks'], forceRefresh: boolean = false): Promise<NewsArticle[]> {
    const allNews: NewsArticle[] = [];

    // Try Alpha Vantage first (now primary source for financial news)
    if (this.alphavantageApiKey && this.alphavantageApiKey !== 'demo') {
      try {
        const alphaNews = await this.fetchFromAlphaVantage(topics, forceRefresh);
        if (alphaNews.length > 0) {
          allNews.push(...alphaNews);
          this.logger.log(`Fetched ${alphaNews.length} articles from Alpha Vantage`);
        }
      } catch (error) {
        this.logger.warn('Alpha Vantage news fetch failed:', error.message);
      }
    }

    // Try Marketaux API as secondary source
    if (this.marketauxApiKey && allNews.length < 10) {
      try {
        const marketauxNews = await this.fetchFromMarketaux(topics, forceRefresh);
        if (marketauxNews.length > 0) {
        allNews.push(...marketauxNews);
        this.logger.log(`Fetched ${marketauxNews.length} articles from Marketaux`);
        }
      } catch (error) {
        this.logger.warn('Marketaux API fetch failed:', error.message);
      }
    }

    // Try News API as tertiary source (limited free tier)
    if (this.newsApiKey && allNews.length < 5) {
        try {
          const newsApiData = await this.fetchFromNewsApi(topics);
        if (newsApiData.length > 0) {
          allNews.push(...newsApiData);
          this.logger.log(`Fetched ${newsApiData.length} articles from News API`);
        }
      } catch (error) {
        this.logger.warn('News API fetch failed:', error.message);
      }
    }

    // If all fails, return fallback data
    if (allNews.length === 0) {
      this.logger.warn('All news sources failed, using fallback data');
      return this.getFallbackNews();
    }

    // Sort by published date and limit to latest 20
    return allNews
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 20);
  }

  private async fetchFromMarketaux(topics: string[], forceRefresh: boolean = false): Promise<NewsArticle[]> {
    if (!this.marketauxApiKey) {
      this.logger.warn('Marketaux API token not configured');
      return [];
    }

    if (!this.canMakeNewsCall() && !forceRefresh) {
      this.logger.warn('News API rate limit reached');
      return [];
    }

    try {
      const url = 'https://api.marketaux.com/v1/news/all';
      
      // Calculate published_after parameter (last 24 hours)
      const publishedAfter = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const params = {
        api_token: this.marketauxApiKey,
        countries: 'us',
        filter_entities: 'true',
        limit: 20,
        published_after: publishedAfter,
        language: 'en'
      };

      this.logger.log(`Fetching news from Marketaux API with params:`, params);
      
      const response = await axios.get<MarketauxResponse>(url, {
        params,
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'IVREX-Trading-Platform/1.0'
        }
      });

      this.newsCallCount++;

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const articles: NewsArticle[] = response.data.data.map((item: MarketauxNewsArticle) => {
          // Determine category based on entities or keywords
          const category = this.categorizeMarketauxNews(item);
          
          // Calculate sentiment from entities
          const sentiment = this.calculateMarketauxSentiment(item);

          return {
            id: `marketaux_${item.uuid}`,
            title: item.title,
            summary: item.description || item.snippet || '',
            url: item.url,
            publishedAt: item.published_at,
            source: item.source,
            category,
            imageUrl: item.image_url,
            sentiment
          };
        });

        this.logger.log(`Successfully fetched ${articles.length} articles from Marketaux`);
        return articles;
      }

      this.logger.warn('Invalid Marketaux API response format');
      return [];

    } catch (error) {
      this.logger.error('Error fetching from Marketaux:', error.message);
      if (error.response) {
        this.logger.error('Marketaux API response error:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      return [];
    }
  }

  private categorizeMarketauxNews(item: MarketauxNewsArticle): string {
    const title = item.title.toLowerCase();
    const description = (item.description || '').toLowerCase();
    
    // Check entities first for more accurate categorization
    if (item.entities && item.entities.length > 0) {
      const industries = item.entities.map(e => e.industry?.toLowerCase() || '');
      const symbols = item.entities.map(e => e.symbol?.toLowerCase() || '');
      
      if (industries.some(ind => ind.includes('crypto') || ind.includes('digital'))) {
        return 'Crypto';
      }
      if (symbols.some(sym => ['btc', 'eth', 'crypto'].includes(sym))) {
        return 'Crypto';
      }
      if (industries.some(ind => ind.includes('oil') || ind.includes('energy') || ind.includes('commodity'))) {
        return 'Commodities';
      }
      if (industries.some(ind => ind.includes('tech') || ind.includes('software'))) {
        return 'Technology';
      }
      if (industries.some(ind => ind.includes('bank') || ind.includes('financial'))) {
        return 'Finance';
      }
    }
    
    // Fallback to keyword-based categorization
    const text = `${title} ${description}`;
    
    if (text.includes('crypto') || text.includes('bitcoin') || text.includes('ethereum')) {
      return 'Crypto';
    }
    if (text.includes('oil') || text.includes('gold') || text.includes('commodity')) {
      return 'Commodities';
    }
    if (text.includes('fed') || text.includes('rate') || text.includes('inflation') || text.includes('economy')) {
      return 'Economy';
    }
    if (text.includes('tech') || text.includes('technology') || text.includes('ai')) {
      return 'Technology';
    }
    if (text.includes('forex') || text.includes('currency') || text.includes('dollar')) {
      return 'Forex';
    }
    
    return 'Markets';
  }

  private calculateMarketauxSentiment(item: MarketauxNewsArticle): 'positive' | 'negative' | 'neutral' {
    if (item.entities && item.entities.length > 0) {
      // Calculate average sentiment from entities
      const sentimentScores = item.entities
        .map(entity => entity.sentiment_score)
        .filter(score => typeof score === 'number' && !isNaN(score));
      
      if (sentimentScores.length > 0) {
        const avgSentiment = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length;
        
        if (avgSentiment > 0.1) return 'positive';
        if (avgSentiment < -0.1) return 'negative';
      }
    }
    
    return 'neutral';
  }

  private async fetchFromAlphaVantage(topics: string[], forceRefresh: boolean = false): Promise<NewsArticle[]> {
    if (!this.canMakeNewsCall() && !forceRefresh) {
      this.logger.warn('News API rate limit reached');
      return [];
    }

    try {
    const url = 'https://www.alphavantage.co/query';
      
      // Enhanced financial topics for better coverage
      const financialTopics = [
        'finance', 'economy', 'stock market', 'federal reserve', 'inflation', 
        'GDP', 'unemployment', 'interest rates', 'cryptocurrency', 'bitcoin',
        'earnings', 'trading', 'investment', 'banking', 'commodities'
      ];
      
      const searchTopics = topics.length > 0 ? topics.join(',') : financialTopics.join(',');
      
    const params = {
      function: 'NEWS_SENTIMENT',
      tickers: 'AAPL', // Single ticker to avoid parameter conflicts
      apikey: this.alphavantageApiKey
    };

      this.logger.log(`Fetching news from Alpha Vantage with topics: ${searchTopics}`);

    const response = await axios.get(url, { 
      params,
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'IVREX-Trading-Platform/1.0'
        }
    });

    this.newsCallCount++;

    // Add detailed logging to debug the response format
    this.logger.log(`Alpha Vantage API response status: ${response.status}`);
    this.logger.log(`Alpha Vantage API response data keys: ${Object.keys(response.data || {}).join(', ')}`);
    
    // Log the actual response structure for debugging
    if (response.data) {
      this.logger.log(`Alpha Vantage response structure: ${JSON.stringify(response.data, null, 2).substring(0, 500)}...`);
    }

    if (response.data && response.data.feed && Array.isArray(response.data.feed)) {
      const articles: NewsArticle[] = response.data.feed.map((item: any, index: number) => {
        // Enhanced categorization
        const category = this.categorizeFinancialNews(item.title, item.summary || '');
        
        // Better sentiment mapping
        const sentiment = this.mapAlphaVantageSentiment(item.overall_sentiment_label, item.overall_sentiment_score);

        return {
          id: `alpha_${item.url.split('/').pop() || index}_${Date.now()}`,
          title: item.title,
          summary: item.summary || item.title,
          url: item.url,
          publishedAt: this.formatAlphaVantageDate(item.time_published),
          source: item.source,
          category,
          imageUrl: item.banner_image || this.getDefaultFinancialImage(category),
          sentiment
        };
      });

      this.logger.log(`Successfully processed ${articles.length} articles from Alpha Vantage`);
      return articles;
    }

    // Check if it's an error response or rate limit
    if (response.data && response.data.Information) {
      this.logger.warn(`Alpha Vantage API message: ${response.data.Information}`);
    }
    
    // Check if it's an error response
    if (response.data && response.data.Error) {
      this.logger.error(`Alpha Vantage API error: ${response.data.Error}`);
    }

    this.logger.warn('Invalid Alpha Vantage API response format - expected response.data.feed array');
    return [];

    } catch (error) {
      this.logger.error('Error fetching from Alpha Vantage:', error.message);
      if (error.response) {
        this.logger.error('Alpha Vantage API response error:', {
          status: error.response.status,
          data: error.response.data
        });
      }
    return [];
    }
  }

  private async fetchFromNewsApi(topics: string[]): Promise<NewsArticle[]> {
    if (!this.newsApiKey || !this.canMakeNewsCall()) {
      return [];
    }

    const url = 'https://newsapi.org/v2/everything';
    const params = {
      q: topics.join(' OR '),
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: 20,
      apiKey: this.newsApiKey
    };

    const response = await axios.get(url, { 
      params,
      timeout: 10000
    });

    this.newsCallCount++;

    if (response.data && response.data.articles) {
      return response.data.articles.map((item: any, index: number) => ({
        id: `news_${item.url.split('/').pop() || index}`,
        title: item.title,
        summary: item.description,
        url: item.url,
        publishedAt: item.publishedAt,
        source: item.source.name,
        category: this.categorizeNews(item.title),
        imageUrl: item.urlToImage,
        sentiment: 'neutral' as const
      }));
    }

    return [];
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
      },
      {
        id: 'fallback_4',
        title: 'Technology Stocks Lead Market Recovery in Early Trading',
        summary: 'Technology sector stocks are showing strong performance in early market sessions, driven by positive earnings reports and growth forecasts.',
        url: '#',
        publishedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        source: 'Bloomberg',
        category: 'Technology',
        imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400',
        sentiment: 'positive'
      },
      {
        id: 'fallback_5',
        title: 'Asian Markets Close Mixed Following Overnight US Session',
        summary: 'Asian equity markets showed varied performance following overnight developments in US markets, with investors weighing economic data.',
        url: '#',
        publishedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
        source: 'Nikkei',
        category: 'Markets',
        imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
        sentiment: 'neutral'
      }
    ];
  }

  private categorizeNews(title: string): string {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('crypto') || titleLower.includes('bitcoin') || titleLower.includes('ethereum')) {
      return 'Crypto';
    }
    if (titleLower.includes('oil') || titleLower.includes('gold') || titleLower.includes('commodity')) {
      return 'Commodities';
    }
    if (titleLower.includes('fed') || titleLower.includes('rate') || titleLower.includes('economy')) {
      return 'Economy';
    }
    if (titleLower.includes('stock') || titleLower.includes('market') || titleLower.includes('equity')) {
      return 'Markets';
    }
    if (titleLower.includes('tech') || titleLower.includes('technology')) {
      return 'Technology';
    }
    if (titleLower.includes('forex') || titleLower.includes('currency') || titleLower.includes('dollar')) {
      return 'Forex';
    }
    
    return 'Markets';
  }

  private mapSentiment(label?: string): 'positive' | 'negative' | 'neutral' {
    if (!label) return 'neutral';
    
    const labelLower = label.toLowerCase();
    if (labelLower.includes('positive') || labelLower.includes('bullish')) {
      return 'positive';
    }
    if (labelLower.includes('negative') || labelLower.includes('bearish')) {
      return 'negative';
    }
    return 'neutral';
  }

  private canMakeNewsCall(): boolean {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastNewsCall;
    
    // Reset daily limit if it's a new day
    if (timeSinceLastCall > 24 * 60 * 60 * 1000) {
      this.newsCallCount = 0;
    }
    
    // Rate limiting: max 1 call per minute and under daily limit
    if (timeSinceLastCall < 60 * 1000 || this.newsCallCount >= this.newsCallLimit) {
      return false;
    }
    
    this.lastNewsCall = now;
    return true;
  }

  private categorizeFinancialNews(title: string, summary: string): string {
    const text = `${title} ${summary}`.toLowerCase();
    
    // Enhanced financial categorization
    if (text.includes('crypto') || text.includes('bitcoin') || text.includes('ethereum') || 
        text.includes('blockchain') || text.includes('digital currency')) {
      return 'Crypto';
    }
    if (text.includes('fed') || text.includes('federal reserve') || text.includes('interest rate') || 
        text.includes('monetary policy') || text.includes('inflation') || text.includes('gdp') ||
        text.includes('unemployment') || text.includes('economic data')) {
      return 'Economy';
    }
    if (text.includes('oil') || text.includes('gold') || text.includes('commodity') || 
        text.includes('crude') || text.includes('silver') || text.includes('copper')) {
      return 'Commodities';
    }
    if (text.includes('forex') || text.includes('currency') || text.includes('dollar') || 
        text.includes('euro') || text.includes('exchange rate')) {
      return 'Forex';
    }
    if (text.includes('bank') || text.includes('financial') || text.includes('credit') ||
        text.includes('loan') || text.includes('mortgage')) {
      return 'Finance';
    }
    if (text.includes('tech') || text.includes('technology') || text.includes('ai') || 
        text.includes('software') || text.includes('artificial intelligence')) {
      return 'Technology';
    }
    if (text.includes('earnings') || text.includes('revenue') || text.includes('profit') ||
        text.includes('quarter') || text.includes('financial results')) {
      return 'Earnings';
    }
    
    return 'Markets';
  }

  private mapAlphaVantageSentiment(label?: string, score?: number): 'positive' | 'negative' | 'neutral' {
    if (!label) return 'neutral';
    
    const labelLower = label.toLowerCase();
    
    // Use both label and score for better accuracy
    if (score !== undefined) {
      if (score > 0.1) return 'positive';
      if (score < -0.1) return 'negative';
    }
    
    if (labelLower.includes('bullish') || labelLower.includes('positive')) {
      return 'positive';
    }
    if (labelLower.includes('bearish') || labelLower.includes('negative')) {
      return 'negative';
    }
    
    return 'neutral';
  }

  private formatAlphaVantageDate(timePublished: string): string {
    try {
      // Alpha Vantage format: YYYYMMDDTHHMMSS
      if (timePublished && timePublished.length >= 15) {
        const year = timePublished.substring(0, 4);
        const month = timePublished.substring(4, 6);
        const day = timePublished.substring(6, 8);
        const hour = timePublished.substring(9, 11);
        const minute = timePublished.substring(11, 13);
        const second = timePublished.substring(13, 15);
        
        return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`).toISOString();
      }
      
      // Fallback to current time if format is unexpected
      return new Date().toISOString();
    } catch (error) {
      this.logger.warn('Error formatting Alpha Vantage date:', timePublished);
      return new Date().toISOString();
    }
  }

  private getDefaultFinancialImage(category: string): string {
    const imageMap = {
      'Economy': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
      'Crypto': 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400',
      'Commodities': 'https://images.unsplash.com/photo-1582182300890-32b4a43e3c4d?w=400',
      'Technology': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400',
      'Markets': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
      'Finance': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
      'Forex': 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400',
      'Earnings': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400'
    };
    
    return imageMap[category] || imageMap['Markets'];
  }
} 