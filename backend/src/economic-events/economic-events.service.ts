import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EconomicApiService } from './economic-api.service';
import { EconomicCacheService, CacheStats } from './economic-cache.service';
import { EconomicEvent, EventImportance } from './economic-event.entity';

interface GetEventsParams {
  startDate?: Date;
  endDate?: Date;
  importance?: EventImportance[];
  countries?: string[];
  limit?: number;
  forceRefresh?: boolean;
}

@Injectable()
export class EconomicEventsService implements OnModuleInit {
  private readonly logger = new Logger(EconomicEventsService.name);
  private isRefreshing = false;
  private isInitialized = false;

  constructor(
    private economicApiService: EconomicApiService,
    private economicCacheService: EconomicCacheService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing EconomicEventsService - pre-warming cache...');
    try {
      // Pre-warm cache with next 7 days of data
      const startDate = new Date();
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      await this.refreshEconomicData(startDate, endDate);
      this.isInitialized = true;
      this.logger.log('EconomicEventsService initialization complete - cache pre-warmed');
    } catch (error) {
      this.logger.error('Failed to pre-warm cache during initialization:', error.message);
      this.isInitialized = true; // Still mark as initialized to avoid blocking
    }
  }

  async getEconomicEvents(params: GetEventsParams = {}): Promise<EconomicEvent[]> {
    const {
      startDate = new Date(),
      endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to next 7 days
      importance,
      countries,
      limit,
      forceRefresh = false
    } = params;

    try {
      this.logger.log(`Getting economic events from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

      // If not initialized yet, wait a bit for cache pre-warming to complete
      if (!this.isInitialized) {
        this.logger.log('Service still initializing, waiting for cache pre-warming...');
        // Wait up to 5 seconds for initialization
        for (let i = 0; i < 50 && !this.isInitialized; i++) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Check if we need to refresh data
      const needsRefresh = forceRefresh || await this.shouldRefreshData(startDate, endDate);
      
      if (needsRefresh && !this.isRefreshing) {
        // Trigger background refresh but don't wait for it
        this.refreshEconomicData(startDate, endDate).catch(error => {
          this.logger.error('Background refresh failed:', error.message);
        });
      }

      // Always serve from cache for fast response
      const events = await this.economicCacheService.getEvents(
        startDate,
        endDate,
        importance,
        countries,
        limit
      );

      this.logger.log(`Serving ${events.length} economic events from cache`);
      return events;

    } catch (error) {
      this.logger.error('Error getting economic events:', error.message);
      return [];
    }
  }

  private async shouldRefreshData(startDate: Date, endDate: Date): Promise<boolean> {
    try {
      const coverage = await this.economicCacheService.getDateRangeCoverage(startDate, endDate);
      
      // Refresh if coverage is less than 80% or we have missing/stale dates
      const shouldRefresh = coverage.coverage < 80 || 
                           coverage.missingDates.length > 0 || 
                           coverage.staleDates.length > 2;

      this.logger.log(`Should refresh data: ${shouldRefresh} (coverage: ${coverage.coverage.toFixed(1)}%, missing: ${coverage.missingDates.length}, stale: ${coverage.staleDates.length})`);
      return shouldRefresh;

    } catch (error) {
      this.logger.error('Error checking if refresh needed:', error.message);
      return true; // Default to refresh on error
    }
  }

  async refreshEconomicData(startDate?: Date, endDate?: Date): Promise<{ success: boolean; eventsCount: number; error?: string }> {
    if (this.isRefreshing) {
      this.logger.warn('Refresh already in progress, skipping');
      return { success: false, eventsCount: 0, error: 'Refresh already in progress' };
    }

    this.isRefreshing = true;

    try {
      const refreshStart = startDate || new Date();
      const refreshEnd = endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // Next 14 days

      this.logger.log(`Starting economic data refresh from ${refreshStart.toISOString().split('T')[0]} to ${refreshEnd.toISOString().split('T')[0]}`);

      // Format dates for API calls
      const fromDate = refreshStart.toISOString().split('T')[0];
      const toDate = refreshEnd.toISOString().split('T')[0];

      // Fetch fresh data from APIs
      const events = await this.economicApiService.fetchCombinedEconomicData(fromDate, toDate);

      if (events.length === 0) {
        this.logger.warn('No events fetched from APIs');
        return { success: false, eventsCount: 0, error: 'No events fetched from APIs' };
      }

      // Clear old data for this date range and save new data
      await this.economicCacheService.refreshDateRange(refreshStart, refreshEnd);
      await this.economicCacheService.saveEvents(events);

      this.logger.log(`Successfully refreshed economic data: ${events.length} events`);
      return { success: true, eventsCount: events.length };

    } catch (error) {
      this.logger.error('Error refreshing economic data:', error.message);
      return { success: false, eventsCount: 0, error: error.message };
    } finally {
      this.isRefreshing = false;
    }
  }

  // Note: Scheduled tasks removed to avoid dependency issues
  // Data can be refreshed manually via the API endpoints

  async getUpcomingHighImpactEvents(days: number = 7): Promise<EconomicEvent[]> {
    const startDate = new Date();
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    return this.getEconomicEvents({
      startDate,
      endDate,
      importance: [EventImportance.HIGH],
      limit: 20
    });
  }

  async getTodaysEvents(): Promise<EconomicEvent[]> {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getEconomicEvents({
      startDate: today,
      endDate: tomorrow,
      limit: 50
    });
  }

  async getEventsByCountry(countryCode: string, days: number = 30): Promise<EconomicEvent[]> {
    const startDate = new Date();
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    return this.getEconomicEvents({
      startDate,
      endDate,
      countries: [countryCode],
      limit: 100
    });
  }

  async getCacheStats(): Promise<CacheStats> {
    return this.economicCacheService.getCacheStats();
  }

  async getApiStatus() {
    const rateLimitStatus = this.economicApiService.getRateLimitStatus();
    const cacheStats = await this.getCacheStats();
    
    return {
      rateLimits: rateLimitStatus,
      cache: cacheStats,
      isRefreshing: this.isRefreshing,
      lastRefresh: cacheStats.lastUpdated,
      status: 'operational'
    };
  }

  async forceRefresh(): Promise<{ success: boolean; eventsCount: number; error?: string }> {
    this.logger.log('Force refresh requested');
    
    const startDate = new Date();
    const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    
    return this.refreshEconomicData(startDate, endDate);
  }
} 