import { 
  Controller, 
  Get, 
  Post, 
  Query, 
  ParseEnumPipe, 
  ParseIntPipe, 
  BadRequestException,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { EconomicEventsService } from './economic-events.service.js';
import { EventImportance } from './economic-event.entity.js';

@Controller('economic-events')
export class EconomicEventsController {
  constructor(private economicEventsService: EconomicEventsService) {}

  @Get()
  async getEconomicEvents(
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
    @Query('importance') importance?: string,
    @Query('countries') countries?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('forceRefresh') forceRefresh?: string
  ) {
    // Parse and validate dates
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateStr) {
      startDate = new Date(startDateStr);
      if (isNaN(startDate.getTime())) {
        throw new BadRequestException('Invalid startDate format. Use YYYY-MM-DD');
      }
    }

    if (endDateStr) {
      endDate = new Date(endDateStr);
      if (isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid endDate format. Use YYYY-MM-DD');
      }
    }

    // Parse importance levels
    let importanceLevels: EventImportance[] | undefined;
    if (importance) {
      const importanceArray = importance.split(',').map(i => i.trim().toLowerCase());
      importanceLevels = importanceArray.map(imp => {
        if (Object.values(EventImportance).includes(imp as EventImportance)) {
          return imp as EventImportance;
        }
        throw new BadRequestException(`Invalid importance level: ${imp}. Use: low, medium, high`);
      });
    }

    // Parse countries
    let countryCodes: string[] | undefined;
    if (countries) {
      countryCodes = countries.split(',').map(c => c.trim().toUpperCase());
    }

    const events = await this.economicEventsService.getEconomicEvents({
      startDate,
      endDate,
      importance: importanceLevels,
      countries: countryCodes,
      limit,
      forceRefresh: forceRefresh === 'true'
    });

    return {
      success: true,
      count: events.length,
      data: events,
      filters: {
        startDate: startDate?.toISOString().split('T')[0],
        endDate: endDate?.toISOString().split('T')[0],
        importance: importanceLevels,
        countries: countryCodes,
        limit
      }
    };
  }

  @Get('today')
  async getTodaysEvents() {
    const events = await this.economicEventsService.getTodaysEvents();
    
    return {
      success: true,
      count: events.length,
      data: events,
      date: new Date().toISOString().split('T')[0]
    };
  }

  @Get('upcoming-high-impact')
  async getUpcomingHighImpactEvents(
    @Query('days', new ParseIntPipe({ optional: true })) days?: number
  ) {
    const events = await this.economicEventsService.getUpcomingHighImpactEvents(days);
    
    return {
      success: true,
      count: events.length,
      data: events,
      daysAhead: days || 7
    };
  }

  @Get('by-country')
  async getEventsByCountry(
    @Query('country') country?: string,
    @Query('days', new ParseIntPipe({ optional: true })) days?: number
  ) {
    if (!country) {
      throw new BadRequestException('Country parameter is required');
    }

    const events = await this.economicEventsService.getEventsByCountry(country.toUpperCase(), days);
    
    return {
      success: true,
      count: events.length,
      data: events,
      country: country.toUpperCase(),
      daysAhead: days || 30
    };
  }

  @Get('status')
  async getStatus() {
    const status = await this.economicEventsService.getApiStatus();
    
    return {
      success: true,
      data: status
    };
  }

  @Get('cache-stats')
  async getCacheStats() {
    const stats = await this.economicEventsService.getCacheStats();
    
    return {
      success: true,
      data: stats
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async forceRefresh() {
    const result = await this.economicEventsService.forceRefresh();
    
    return {
      success: result.success,
      eventsCount: result.eventsCount,
      error: result.error,
      message: result.success 
        ? `Successfully refreshed ${result.eventsCount} economic events`
        : `Refresh failed: ${result.error}`
    };
  }
} 