import { Controller, Get, Query, Logger } from '@nestjs/common';
import { DerivMarketDataService } from './deriv-market-data.service';
import { MarketDataWebSocketGateway } from './market-data-websocket.gateway';

@Controller('market-data')
export class MarketDataController {
  private readonly logger = new Logger(MarketDataController.name);

  constructor(
    private readonly derivMarketDataService: DerivMarketDataService,
    private readonly marketDataGateway: MarketDataWebSocketGateway,
  ) {}

  @Get('symbols')
  async getActiveSymbols() {
    try {
      const symbols = await this.derivMarketDataService.getActiveSymbols();
      return {
        success: true,
        data: symbols,
        count: symbols.length
      };
    } catch (error) {
      this.logger.error('Error fetching active symbols:', error);
      return {
        success: false,
        error: 'Failed to fetch active symbols',
        data: []
      };
    }
  }

  @Get('recommended')
  getRecommendedSymbols() {
    const symbols = this.derivMarketDataService.getRecommendedSymbols();
    return {
      success: true,
      data: symbols
    };
  }

  @Get('prices')
  getCurrentPrices(@Query('symbols') symbols?: string) {
    const symbolList = symbols ? symbols.split(',') : [];
    
    if (symbolList.length > 0) {
      const prices = symbolList.map(symbol => 
        this.derivMarketDataService.getSymbolPrice(symbol)
      ).filter(price => price !== null);
      
      return {
        success: true,
        data: prices,
        count: prices.length
      };
    }

    const allPrices = this.derivMarketDataService.getCurrentPrices();
    return {
      success: true,
      data: allPrices,
      count: allPrices.length
    };
  }

  @Get('status')
  getAPIStatus() {
    const isConnected = this.derivMarketDataService.isAPIConnected();
    const connectionStats = this.marketDataGateway.getConnectionStats();
    
    return {
      success: true,
      data: {
        derivAPIConnected: isConnected,
        websocketStats: connectionStats,
        timestamp: new Date().toISOString()
      }
    };
  }

  @Get('symbol/:symbol')
  getSymbolPrice(@Query('symbol') symbol: string) {
    if (!symbol) {
      return {
        success: false,
        error: 'Symbol parameter required'
      };
    }

    const price = this.derivMarketDataService.getSymbolPrice(symbol);
    
    if (!price) {
      return {
        success: false,
        error: 'Symbol not found or not subscribed',
        data: null
      };
    }

    return {
      success: true,
      data: price
    };
  }
}