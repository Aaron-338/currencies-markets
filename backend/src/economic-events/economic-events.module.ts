import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EconomicEvent } from './economic-event.entity.js';
import { EconomicEventsController } from './economic-events.controller.js';
import { EconomicEventsService } from './economic-events.service.js';
import { EconomicApiService } from './economic-api.service.js';
import { EconomicCacheService } from './economic-cache.service.js';

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