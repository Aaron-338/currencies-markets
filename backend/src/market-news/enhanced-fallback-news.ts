import { NewsArticle } from './news-api.service';

export class EnhancedFallbackNews {
  private newsTemplates = [
    // Economy
    {
      titleTemplate: "Federal Reserve {action} Interest Rates by {amount} Basis Points",
      actions: ["Raises", "Cuts", "Maintains", "Signals Change to"],
      amounts: ["25", "50", "75", "unchanged"],
      category: "Economy",
      source: "Federal Reserve",
      sentiment: "neutral"
    },
    {
      titleTemplate: "{indicator} Shows {direction} Trend in {month} Report",
      indicators: ["Consumer Price Index", "Non-Farm Payrolls", "GDP Growth", "Industrial Production"],
      directions: ["Strong Upward", "Moderate Upward", "Stable", "Declining", "Mixed"],
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      category: "Economy",
      source: "Bureau of Labor Statistics",
      sentiment: "neutral"
    },
    
    // Crypto
    {
      titleTemplate: "{crypto} {action} {percentage}% as {reason}",
      cryptos: ["Bitcoin", "Ethereum", "Cryptocurrency Markets"],
      actions: ["Surges", "Drops", "Rallies", "Fluctuates"],
      percentages: ["5", "8", "12", "15", "3", "7"],
      reasons: ["Institutional Adoption Increases", "Regulatory Clarity Emerges", "Market Sentiment Shifts", "Trading Volume Spikes"],
      category: "Crypto",
      source: "CoinDesk",
      sentiment: "positive"
    },
    
    // Markets
    {
      titleTemplate: "{market} {action} {percentage}% Following {event}",
      markets: ["S&P 500", "Dow Jones", "NASDAQ", "Russell 2000"],
      actions: ["Gains", "Falls", "Closes Up", "Closes Down", "Rebounds"],
      percentages: ["0.5", "1.2", "0.8", "1.5", "2.1"],
      events: ["Strong Earnings Reports", "Economic Data Release", "Fed Comments", "Geopolitical Developments"],
      category: "Markets",
      source: "MarketWatch",
      sentiment: "neutral"
    },
    
    // Technology
    {
      titleTemplate: "{company} {action} After {event}",
      companies: ["Apple", "Microsoft", "Google", "Amazon", "Tesla", "Meta"],
      actions: ["Stock Rises 3%", "Shares Jump 5%", "Stock Dips 2%", "Shares Climb 4%"],
      events: ["Strong Quarterly Results", "Product Launch", "Partnership Announcement", "Analyst Upgrade"],
      category: "Technology",
      source: "TechCrunch",
      sentiment: "positive"
    },
    
    // Commodities
    {
      titleTemplate: "{commodity} Prices {action} on {reason}",
      commodities: ["Oil", "Gold", "Silver", "Natural Gas", "Copper"],
      actions: ["Rise Sharply", "Fall Moderately", "Stabilize", "Hit New Highs", "Decline"],
      reasons: ["Supply Concerns", "Demand Outlook", "Geopolitical Tensions", "Economic Data", "Currency Movements"],
      category: "Commodities",
      source: "Reuters",
      sentiment: "neutral"
    },
    
    // Forex
    {
      titleTemplate: "{currency1}/{currency2} {action} to {level} as {reason}",
      currency1: ["USD", "EUR", "GBP", "JPY"],
      currency2: ["USD", "EUR", "GBP", "JPY"],
      actions: ["Rises", "Falls", "Climbs", "Drops", "Stabilizes"],
      levels: ["1.0850", "1.2450", "0.8750", "110.50", "1.3200"],
      reasons: ["Central Bank Policy Diverges", "Economic Data Surprises", "Risk Sentiment Changes", "Interest Rate Expectations Shift"],
      category: "Forex",
      source: "Financial Times",
      sentiment: "neutral"
    }
  ];

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private generateNewsFromTemplate(template: any, index: number): NewsArticle {
    let title = template.titleTemplate;
    
    // Replace placeholders with random values
    Object.keys(template).forEach(key => {
      if (key.endsWith('Template') || key === 'category' || key === 'source' || key === 'sentiment') return;
      
      if (Array.isArray(template[key])) {
        const placeholder = `{${key.slice(0, -1)}}`;
        if (title.includes(placeholder)) {
          title = title.replace(placeholder, this.getRandomElement(template[key]));
        }
      }
    });

    // Special handling for currency pairs to avoid same currency
    if (template.currency1 && template.currency2) {
      const curr1 = this.getRandomElement(template.currency1);
      let curr2 = this.getRandomElement(template.currency2);
      while (curr1 === curr2) {
        curr2 = this.getRandomElement(template.currency2);
      }
      title = title.replace('{currency1}', curr1).replace('{currency2}', curr2);
    }

    const now = new Date();
    const hoursAgo = Math.floor(Math.random() * 12) + 1;
    const publishedAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

    // Generate realistic summary based on category
    const summary = this.generateSummary(template.category, title);

    return {
      id: `enhanced_fallback_${Date.now()}_${index}`,
      title,
      summary,
      url: '#',
      publishedAt: publishedAt.toISOString(),
      source: template.source,
      category: template.category,
      imageUrl: this.getCategoryImage(template.category),
      sentiment: this.getRandomSentiment(template.sentiment)
    };
  }

  private generateSummary(category: string, title: string): string {
    const summaries = {
      Economy: [
        "Economic indicators continue to show mixed signals as policymakers assess the current market conditions and future outlook.",
        "Market analysts are closely monitoring the latest economic data for insights into potential policy changes and market trends.",
        "The economic landscape remains dynamic with various factors influencing market sentiment and trading decisions.",
        "Financial markets are responding to the latest economic developments with cautious optimism."
      ],
      Crypto: [
        "Cryptocurrency markets are experiencing significant volatility as institutional interest and regulatory developments shape the landscape.",
        "Digital asset traders are closely watching market movements and adoption trends across major cryptocurrencies.",
        "The crypto market continues to evolve with new developments in blockchain technology and regulatory frameworks.",
        "Market participants are assessing the long-term implications of recent cryptocurrency market movements."
      ],
      Markets: [
        "Stock market indices are reflecting investor sentiment amid ongoing economic uncertainty and corporate earnings reports.",
        "Trading volumes remain elevated as market participants navigate current economic conditions and policy developments.",
        "Equity markets are showing mixed performance as investors weigh various economic and geopolitical factors.",
        "Market volatility continues as traders assess the implications of recent economic data and policy announcements."
      ],
      Technology: [
        "Technology sector performance continues to be driven by innovation, earnings results, and market adoption of new products.",
        "Tech stocks are experiencing varied performance as investors evaluate growth prospects and market conditions.",
        "The technology industry remains at the forefront of market attention with ongoing developments in AI and digital transformation.",
        "Technology companies are navigating evolving market conditions while pursuing growth opportunities."
      ],
      Commodities: [
        "Commodity markets are responding to supply and demand dynamics amid global economic developments and geopolitical factors.",
        "Traders are monitoring commodity price movements closely as various global factors influence market sentiment.",
        "The commodities sector continues to be influenced by economic data, weather patterns, and geopolitical events.",
        "Market participants are assessing the outlook for commodity prices based on current supply and demand fundamentals."
      ],
      Forex: [
        "Currency markets are experiencing fluctuations as central bank policies and economic data influence exchange rates.",
        "Foreign exchange traders are closely monitoring policy developments and economic indicators across major economies.",
        "The forex market continues to reflect changing economic conditions and monetary policy expectations globally.",
        "Currency pair movements are being driven by diverging economic policies and market sentiment factors."
      ]
    };

    const categorySummaries = summaries[category] || summaries.Markets;
    return this.getRandomElement(categorySummaries);
  }

  private getCategoryImage(category: string): string {
    const imageMap = {
      Economy: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300',
      Crypto: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=300',
      Markets: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300',
      Technology: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300',
      Commodities: 'https://images.unsplash.com/photo-1582182300890-32b4a43e3c4d?w=400&h=300',
      Forex: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&h=300'
    };

    return imageMap[category] || imageMap.Markets;
  }

  private getRandomSentiment(baseSentiment: string): 'positive' | 'negative' | 'neutral' {
    if (baseSentiment === 'neutral') {
      const sentiments: ('positive' | 'negative' | 'neutral')[] = ['positive', 'negative', 'neutral', 'neutral']; // Weighted toward neutral
      return this.getRandomElement(sentiments);
    }
    
    return baseSentiment as 'positive' | 'negative' | 'neutral';
  }

  public generateEnhancedFallbackNews(count: number = 10): NewsArticle[] {
    const news: NewsArticle[] = [];
    
    for (let i = 0; i < count; i++) {
      const template = this.getRandomElement(this.newsTemplates);
      news.push(this.generateNewsFromTemplate(template, i));
    }
    
    // Sort by published date (newest first)
    return news.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  public generateDailyRotatingNews(): NewsArticle[] {
    // Generate different news based on the day to provide variety
    const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const seed = dayOfYear % 1000; // Changes daily
    
    // Use seed to make "random" choices consistent for the day
    Math.random = () => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    return this.generateEnhancedFallbackNews(15);
  }
}