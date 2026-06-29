import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import DerivAPI from '@deriv/deriv-api';
import WebSocket from 'ws';

export interface MarketDataTick {
  symbol: string;
  price: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  timestamp: Date;
  volume?: string;
}

export interface DerivSymbolInfo {
  symbol: string;
  displayName: string;
  category: 'forex' | 'crypto' | 'stocks' | 'indices' | 'commodities' | 'synthetic';
  isActive: boolean;
}

@Injectable()
export class DerivMarketDataService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DerivMarketDataService.name);
  private api: DerivAPI;
  private connection: WebSocket;
  private isConnected = false;
  private subscriptions = new Map<string, any>();
  private priceHistory = new Map<string, MarketDataTick>();
  private subscribers = new Set<(data: MarketDataTick) => void>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 5000;
  private pingInterval: NodeJS.Timeout | null = null;
  private isReconnecting = false;
  
  // Your registered app ID
  private readonly APP_ID = '87928';
  private readonly WS_URL = `wss://ws.derivws.com/websockets/v3?app_id=${this.APP_ID}`;

  async onModuleInit() {
    await this.initializeDerivAPI();
  }

  onModuleDestroy() {
    this.cleanup();
  }

  private async initializeDerivAPI() {
    if (this.isReconnecting) {
      return;
    }

    try {
      if (this.reconnectAttempts === 0) {
        this.logger.log(`🔗 Connecting to Deriv API with app_id: ${this.APP_ID}`);
      }
      
      this.connection = new WebSocket(this.WS_URL);
      this.api = new DerivAPI({ connection: this.connection });

      this.connection.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.isReconnecting = false;
        this.logger.log('✅ Successfully connected to Deriv API');
        this.startHeartbeat();
      };

      this.connection.onclose = (event) => {
        this.isConnected = false;
        this.stopHeartbeat();
        
        if (event.code !== 1000 && !this.isReconnecting) {
          this.handleReconnection();
        }
      };

      this.connection.onerror = (error) => {
        if (this.reconnectAttempts === 0) {
          this.logger.error('❌ Deriv API connection error:', error);
        }
      };

    } catch (error) {
      this.logger.error('💥 Failed to initialize Deriv API:', error);
      this.handleReconnection();
    }
  }

  // Get list of available symbols from Deriv
  async getActiveSymbols(): Promise<DerivSymbolInfo[]> {
    if (!this.isConnected) {
      throw new Error('Deriv API not connected');
    }

    try {
      const response = await this.api.send({ active_symbols: 'brief' });
      
      return response.active_symbols
        .filter(symbol => symbol.exchange_is_open || symbol.is_trading_suspended === 0)
        .map(symbol => ({
          symbol: symbol.symbol,
          displayName: symbol.display_name,
          category: this.categorizeSymbol(symbol.symbol),
          isActive: symbol.exchange_is_open === 1
        }));
    } catch (error) {
      this.logger.error('Failed to fetch active symbols:', error);
      return [];
    }
  }

  // Subscribe to real-time price updates for multiple symbols
  async subscribeToSymbols(symbols: string[]): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn('Cannot subscribe: Deriv API not connected');
      return;
    }

    this.logger.log(`📊 Subscribing to ${symbols.length} symbols: ${symbols.join(', ')}`);

    for (const symbol of symbols) {
      try {
        // Skip if already subscribed
        if (this.subscriptions.has(symbol)) {
          this.logger.debug(`Already subscribed to ${symbol}`);
          continue;
        }

        const tickStream = this.api.tickStream(symbol);
        
        tickStream.onUpdate((tick) => {
          const marketData = this.processTickData(tick);
          this.updatePriceHistory(marketData);
          this.notifySubscribers(marketData);
        });

        this.subscriptions.set(symbol, tickStream);
        this.logger.log(`✅ Subscribed to ${symbol}`);

      } catch (error) {
        this.logger.error(`Failed to subscribe to ${symbol}:`, error);
      }
    }
  }

  // Unsubscribe from specific symbols
  async unsubscribeFromSymbols(symbols: string[]): Promise<void> {
    symbols.forEach(symbol => {
      const subscription = this.subscriptions.get(symbol);
      if (subscription) {
        try {
          subscription.unsubscribe();
          this.subscriptions.delete(symbol);
          this.priceHistory.delete(symbol);
          this.logger.log(`🚫 Unsubscribed from ${symbol}`);
        } catch (error) {
          this.logger.error(`Failed to unsubscribe from ${symbol}:`, error);
        }
      }
    });
  }

  // Add subscriber for real-time updates
  addSubscriber(callback: (data: MarketDataTick) => void): () => void {
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  // Get current prices for all subscribed symbols
  getCurrentPrices(): MarketDataTick[] {
    return Array.from(this.priceHistory.values());
  }

  // Get price for a specific symbol
  getSymbolPrice(symbol: string): MarketDataTick | null {
    return this.priceHistory.get(symbol) || null;
  }

  // Check connection status
  isAPIConnected(): boolean {
    return this.isConnected;
  }

  // Get recommended symbols for different categories
  getRecommendedSymbols(): { [category: string]: string[] } {
    return {
      forex: ['frxEURUSD', 'frxGBPUSD', 'frxUSDJPY', 'frxAUDUSD', 'frxUSDCAD'],
      crypto: ['cryBTCUSD', 'cryETHUSD', 'cryLTCUSD', 'cryXRPUSD', 'cryADAUSD'],
      commodities: ['frxXAUUSD', 'frxXAGUSD', 'frxXPDUSD', 'frxXPTUSD'],
      indices: ['OTC_AS51', 'OTC_SPC', 'OTC_FCHI', 'OTC_DEU30'],
      synthetic: ['R_10', 'R_25', 'R_50', 'R_75', 'R_100', 'BOOM1000', 'CRASH1000']
    };
  }

  private processTickData(tick: any): MarketDataTick {
    const symbol = tick.tick.symbol;
    const currentPrice = tick.tick.quote;
    const previousTick = this.priceHistory.get(symbol);
    
    const previousPrice = previousTick?.price || currentPrice;
    const change = currentPrice - previousPrice;
    const changePercent = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;

    return {
      symbol,
      price: currentPrice,
      previousPrice,
      change,
      changePercent,
      high: Math.max(previousTick?.high || currentPrice, currentPrice),
      low: Math.min(previousTick?.low || currentPrice, currentPrice),
      timestamp: new Date(tick.tick.epoch * 1000),
      volume: 'Live'
    };
  }

  private updatePriceHistory(marketData: MarketDataTick) {
    this.priceHistory.set(marketData.symbol, marketData);
  }

  private notifySubscribers(marketData: MarketDataTick) {
    this.subscribers.forEach(callback => {
      try {
        callback(marketData);
      } catch (error) {
        this.logger.error('Error notifying subscriber:', error);
      }
    });
  }

  private categorizeSymbol(symbol: string): DerivSymbolInfo['category'] {
    if (symbol.startsWith('frx')) {
      if (symbol.includes('XAU') || symbol.includes('XAG') || symbol.includes('XPD') || symbol.includes('XPT')) {
        return 'commodities';
      }
      return 'forex';
    }
    if (symbol.startsWith('cry')) return 'crypto';
    if (symbol.startsWith('OTC_')) return 'indices';
    if (symbol.startsWith('R_') || symbol.includes('BOOM') || symbol.includes('CRASH')) return 'synthetic';
    return 'stocks';
  }

  private handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error(`Max reconnection attempts (${this.maxReconnectAttempts}) reached. Stopping reconnection.`);
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;
    
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 60000);
    
    if (this.reconnectAttempts <= 3) {
      this.logger.warn(`Connection lost. Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    }
    
    setTimeout(() => this.initializeDerivAPI(), delay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.isConnected && this.connection.readyState === WebSocket.OPEN) {
        try {
          this.api.send({ ping: 1 }).catch(() => {});
        } catch (error) {
          // Ignore ping errors
        }
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private cleanup() {
    this.logger.log('🧹 Cleaning up Deriv API connections...');
    
    this.stopHeartbeat();
    
    // Unsubscribe from all symbols
    const allSymbols = Array.from(this.subscriptions.keys());
    if (allSymbols.length > 0) {
      this.unsubscribeFromSymbols(allSymbols);
    }

    // Close WebSocket connection
    if (this.connection && this.connection.readyState === WebSocket.OPEN) {
      this.connection.close(1000, 'Service shutdown');
    }

    // Clear subscribers
    this.subscribers.clear();
    this.priceHistory.clear();

    this.logger.log('✅ Deriv API cleanup completed');
  }
}