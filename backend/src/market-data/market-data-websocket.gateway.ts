import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { DerivMarketDataService, MarketDataTick } from './deriv-market-data.service';

@Injectable()
@WebSocketGateway({
  namespace: '/market-data',
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001', 
      'https://localhost:3000',
      'https://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['*'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
})
export class MarketDataWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MarketDataWebSocketGateway.name);
  private connectedClients = new Map<string, Socket>();
  private clientSubscriptions = new Map<string, Set<string>>();
  private derivUnsubscribe: (() => void) | null = null;

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => DerivMarketDataService))
    private readonly derivMarketDataService: DerivMarketDataService,
  ) {}

  onModuleInit() {
    // Subscribe to Deriv market data updates
    this.derivUnsubscribe = this.derivMarketDataService.addSubscriber(
      (marketData: MarketDataTick) => {
        this.broadcastMarketData(marketData);
      }
    );
  }

  afterInit(server: Server) {
    this.logger.log('🚀 Market Data WebSocket Gateway initialized');
    this.logger.log('🌍 Namespace: /market-data');
  }

  async handleConnection(client: Socket) {
    try {
      this.logger.log(`🔗 Market data connection attempt: ${client.id}`);
      
      // Extract token (optional for market data - it's public)
      const token = 
        client.handshake.query.token as string || 
        client.handshake.auth?.token as string ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      let userId = 'anonymous';
      
      // If token provided, authenticate user
      if (token) {
        try {
          const payload = this.jwtService.verify(token);
          const user = await this.usersService.findOne(payload.sub);
          
          if (user) {
            userId = user.id.toString();
            (client as any).userId = userId;
            (client as any).user = user;
            this.logger.log(`✅ Authenticated user ${userId} connected to market data`);
          }
        } catch (jwtError) {
          this.logger.warn('⚠️ Invalid token for market data, proceeding as anonymous');
        }
      }

      // Store client connection
      this.connectedClients.set(client.id, client);
      this.clientSubscriptions.set(client.id, new Set());

      // Send connection confirmation
      client.emit('connected', {
        message: 'Connected to market data stream',
        clientId: client.id,
        userId: userId
      });

      // Send current market data if available
      const currentPrices = this.derivMarketDataService.getCurrentPrices();
      if (currentPrices.length > 0) {
        client.emit('initial_market_data', { prices: currentPrices });
      }

      // Send API connection status
      client.emit('api_status', {
        connected: this.derivMarketDataService.isAPIConnected(),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error('💥 Error handling market data connection:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const clientId = client.id;
    const userId = (client as any).userId || 'anonymous';
    
    // Clean up client data
    this.connectedClients.delete(clientId);
    this.clientSubscriptions.delete(clientId);
    
    this.logger.log(`🔌 Client ${clientId} (user: ${userId}) disconnected from market data`);
  }

  @SubscribeMessage('subscribe_symbols')
  async handleSubscribeSymbols(
    @MessageBody() data: { symbols: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    const clientId = client.id;
    const { symbols } = data;

    if (!Array.isArray(symbols) || symbols.length === 0) {
      client.emit('error', { message: 'Invalid symbols array' });
      return;
    }

    try {
      // Update client subscriptions
      const clientSubscriptions = this.clientSubscriptions.get(clientId) || new Set();
      symbols.forEach(symbol => clientSubscriptions.add(symbol));
      this.clientSubscriptions.set(clientId, clientSubscriptions);

      // Get all unique symbols across all clients
      const allSymbols = new Set<string>();
      this.clientSubscriptions.forEach(subscriptions => {
        subscriptions.forEach(symbol => allSymbols.add(symbol));
      });

      // Subscribe to Deriv API for these symbols
      await this.derivMarketDataService.subscribeToSymbols(Array.from(allSymbols));

      // Join client to symbol-specific rooms
      symbols.forEach(symbol => {
        client.join(`symbol_${symbol}`);
      });

      client.emit('subscribed', { 
        symbols, 
        message: `Subscribed to ${symbols.length} symbols` 
      });

      this.logger.log(`📊 Client ${clientId} subscribed to: ${symbols.join(', ')}`);

    } catch (error) {
      this.logger.error('Error subscribing to symbols:', error);
      client.emit('error', { message: 'Failed to subscribe to symbols' });
    }
  }

  @SubscribeMessage('unsubscribe_symbols')
  async handleUnsubscribeSymbols(
    @MessageBody() data: { symbols: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    const clientId = client.id;
    const { symbols } = data;

    if (!Array.isArray(symbols)) {
      client.emit('error', { message: 'Invalid symbols array' });
      return;
    }

    try {
      // Update client subscriptions
      const clientSubscriptions = this.clientSubscriptions.get(clientId) || new Set();
      symbols.forEach(symbol => {
        clientSubscriptions.delete(symbol);
        client.leave(`symbol_${symbol}`);
      });
      this.clientSubscriptions.set(clientId, clientSubscriptions);

      client.emit('unsubscribed', { 
        symbols, 
        message: `Unsubscribed from ${symbols.length} symbols` 
      });

      this.logger.log(`🚫 Client ${clientId} unsubscribed from: ${symbols.join(', ')}`);

      // Check if any client still needs these symbols
      const stillNeeded = new Set<string>();
      this.clientSubscriptions.forEach(subscriptions => {
        subscriptions.forEach(symbol => stillNeeded.add(symbol));
      });

      // Unsubscribe from Deriv API for symbols no longer needed
      const toUnsubscribe = symbols.filter(symbol => !stillNeeded.has(symbol));
      if (toUnsubscribe.length > 0) {
        await this.derivMarketDataService.unsubscribeFromSymbols(toUnsubscribe);
      }

    } catch (error) {
      this.logger.error('Error unsubscribing from symbols:', error);
      client.emit('error', { message: 'Failed to unsubscribe from symbols' });
    }
  }

  @SubscribeMessage('get_active_symbols')
  async handleGetActiveSymbols(@ConnectedSocket() client: Socket) {
    try {
      const symbols = await this.derivMarketDataService.getActiveSymbols();
      client.emit('active_symbols', { symbols });
    } catch (error) {
      this.logger.error('Error fetching active symbols:', error);
      client.emit('error', { message: 'Failed to fetch active symbols' });
    }
  }

  @SubscribeMessage('get_recommended_symbols')
  handleGetRecommendedSymbols(@ConnectedSocket() client: Socket) {
    const recommended = this.derivMarketDataService.getRecommendedSymbols();
    client.emit('recommended_symbols', { symbols: recommended });
  }

  @SubscribeMessage('get_current_prices')
  handleGetCurrentPrices(@ConnectedSocket() client: Socket) {
    const prices = this.derivMarketDataService.getCurrentPrices();
    client.emit('current_prices', { prices });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { 
      timestamp: new Date().toISOString(),
      apiConnected: this.derivMarketDataService.isAPIConnected()
    });
  }

  // Broadcast market data to relevant clients
  private broadcastMarketData(marketData: MarketDataTick) {
    const symbolRoom = `symbol_${marketData.symbol}`;
    
    // Emit to all clients subscribed to this symbol
    this.server.to(symbolRoom).emit('price_update', {
      type: 'price_update',
      data: marketData
    });

    // Also emit to general market data room (for clients wanting all updates)
    this.server.emit('market_tick', {
      type: 'market_tick',
      data: marketData
    });
  }

  // Broadcast API status changes
  broadcastAPIStatus(connected: boolean) {
    this.server.emit('api_status', {
      connected,
      timestamp: new Date().toISOString()
    });
  }

  // Get connection statistics
  getConnectionStats() {
    const totalConnections = this.connectedClients.size;
    const totalSubscriptions = Array.from(this.clientSubscriptions.values())
      .reduce((acc, subs) => acc + subs.size, 0);
    
    const uniqueSymbols = new Set<string>();
    this.clientSubscriptions.forEach(subscriptions => {
      subscriptions.forEach(symbol => uniqueSymbols.add(symbol));
    });

    return {
      totalConnections,
      totalSubscriptions,
      uniqueSymbols: uniqueSymbols.size,
      symbolsList: Array.from(uniqueSymbols)
    };
  }

  // Cleanup on module destroy
  onModuleDestroy() {
    if (this.derivUnsubscribe) {
      this.derivUnsubscribe();
    }
  }
}