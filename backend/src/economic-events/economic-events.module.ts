import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EconomicEvent } from './economic-event.entity';
import { EconomicEventsController } from './economic-events.controller';
import { EconomicEventsService } from './economic-events.service';
import { EconomicApiService } from './economic-api.service';
import { EconomicCacheService } from './economic-cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EconomicEvent]),
  ],
  controllers: [EconomicEventsController],
  providers: [
    EconomicEventsService,
    EconomicApiService,
    EconomicCacheService,
  ],
  exports: [
    EconomicEventsService,
    EconomicApiService,
    EconomicCacheService,
  ],
})
export class EconomicEventsModule {} 