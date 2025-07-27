export const economicCalendarConfig = {
  // API Configuration
  fmp: {
    baseUrl: 'https://financialmodelingprep.com/api/v3',
    apiKey: process.env.FMP_API_KEY || '',
    dailyLimit: parseInt(process.env.FMP_DAILY_LIMIT || '250'),
    endpoints: {
      marketHours: '/market-hours',
      earnings: '/earning_calendar',
      dividends: '/stock_dividend_calendar',
      splits: '/stock_split_calendar',
    }
  },
  
  fred: {
    baseUrl: 'https://api.stlouisfed.org/fred',
    apiKey: process.env.FRED_API_KEY || '',
    dailyLimit: parseInt(process.env.FRED_DAILY_LIMIT || '999999'),
    endpoints: {
      releases: '/releases/dates',
      series: '/series/observations'
    }
  },

  // Cache Configuration
  cache: {
    ttlHours: parseInt(process.env.ECONOMIC_CACHE_TTL_HOURS || '24'),
    refreshIntervalMinutes: parseInt(process.env.ECONOMIC_REFRESH_INTERVAL_MINUTES || '60'),
  },

  // Rate Limiting (Adjusted for Free Tier)
  rateLimiting: {
    enabled: true,
    fmpCallsPerMinute: 1, // Very conservative for free tier (250/day)
    fredCallsPerMinute: 100,
  },

  // Fallback Configuration
  fallback: {
    enableScraping: process.env.ENABLE_SCRAPING_FALLBACK === 'true',
    userAgent: process.env.SCRAPING_USER_AGENT || 'EconomicCalendar/1.0',
    timeout: 30000,
  }
};

export const validateConfig = () => {
  const errors: string[] = [];
  
  if (!economicCalendarConfig.fmp.apiKey) {
    errors.push('FMP_API_KEY is required');
  }
  
  if (!economicCalendarConfig.fred.apiKey) {
    errors.push('FRED_API_KEY is required');
  }
  
  if (errors.length > 0) {
    throw new Error(`Economic Calendar Configuration Error: ${errors.join(', ')}`);
  }
}; 