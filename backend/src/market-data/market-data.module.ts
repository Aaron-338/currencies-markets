import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DerivMarketDataService } from './deriv-market-data.service';
import { MarketDataWebSocketGateway } from './market-data-websocket.gateway';
import { MarketDataController } from './market-data.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [
    DerivMarketDataService,
    MarketDataWebSocketGateway,
  ],
  controllers: [MarketDataController],
  exports: [DerivMarketDataService, MarketDataWebSocketGateway],
})
export class MarketDataModule {}