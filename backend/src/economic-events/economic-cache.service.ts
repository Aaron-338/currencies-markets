import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { EconomicEvent, EventImportance } from './economic-event.entity.js';
import { economicCalendarConfig } from '../config/economic-calendar.config.js';

export interface CacheStats {
  totalEvents: number;
  eventsByImportance: Record<EventImportance, number>;
  eventsByCountry: Record<string, number>;
  oldestEvent: Date | null;
  newestEvent: Date | null;
  lastUpdated: Date | null;
}

@Injectable()
export class EconomicCacheService {
  private readonly logger = new Logger(EconomicCacheService.name);

  constructor(
    @InjectRepository(EconomicEvent)
    private economicEventRepository: Repository<EconomicEvent>,
  ) {}

  async saveEvents(events: EconomicEvent[]): Promise<void> {
    if (events.length === 0) {
      this.logger.warn('No events to save');
      return;
    }

    try {
      // Use upsert to handle duplicates gracefully
      for (const event of events) {
        await this.economicEventRepository.save(event, {
          // Update if exists based on externalId
          // This handles the case where we get updated data for the same event
        });
      }

      this.logger.log(`Successfully saved ${events.length} economic events to cache`);
    } catch (error) {
      this.logger.error('Error saving events to cache:', error.message);
      throw error;
    }
  }

  async getEvents(
    startDate: Date,
    endDate: Date,
    importance?: EventImportance[],
    countries?: string[],
    limit?: number
  ): Promise<EconomicEvent[]> {
    try {
      const queryBuilder = this.economicEventRepository
        .createQueryBuilder('event')
        .where('event.releaseDate BETWEEN :startDate AND :endDate', {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        });

      if (importance && importance.length > 0) {
        queryBuilder.andWhere('event.importance IN (:...importance)', { importance });
      }

      if (countries && countries.length > 0) {
        queryBuilder.andWhere('event.countryCode IN (:...countries)', { countries });
      }

      queryBuilder
        .orderBy('event.releaseDate', 'ASC')
        .addOrderBy('event.releaseTime', 'ASC')
        .addOrderBy('event.importance', 'DESC');

      if (limit) {
        queryBuilder.limit(limit);
      }

      const events = await queryBuilder.getMany();
      
      this.logger.log(`Retrieved ${events.length} events from cache for date range ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
      return events;

    } catch (error) {
      this.logger.error('Error retrieving events from cache:', error.message);
      return [];
    }
  }

  async isDataFresh(date: Date): Promise<boolean> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const recentEvent = await this.economicEventRepository.findOne({
        where: {
          releaseDate: Between(startOfDay, endOfDay),
          lastUpdated: LessThan(new Date(Date.now() - economicCalendarConfig.cache.ttlHours * 60 * 60 * 1000))
        },
        order: { lastUpdated: 'DESC' }
      });

      const isFresh = recentEvent === null; // If we find an old event, data is not fresh
      
      this.logger.log(`Cache freshness check for ${date.toISOString().split('T')[0]}: ${isFresh ? 'fresh' : 'stale'}`);
      return !isFresh; // Invert because we want true when data IS fresh

    } catch (error) {
      this.logger.error('Error checking cache freshness:', error.message);
      return false; // Assume not fresh on error
    }
  }

  async getDateRangeCoverage(startDate: Date, endDate: Date): Promise<{
    missingDates: Date[];
    staleDates: Date[];
    coverage: number;
  }> {
    try {
      const missingDates: Date[] = [];
      const staleDates: Date[] = [];
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const current = new Date(startDate);
      while (current <= endDate) {
        const dayStart = new Date(current);
        dayStart.setHours(0, 0, 0, 0);
        
        const dayEnd = new Date(current);
        dayEnd.setHours(23, 59, 59, 999);

        const eventsCount = await this.economicEventRepository.count({
          where: {
            releaseDate: Between(dayStart, dayEnd)
          }
        });

        const staleThreshold = new Date(Date.now() - economicCalendarConfig.cache.ttlHours * 60 * 60 * 1000);
        const freshEventsCount = await this.economicEventRepository.count({
          where: {
            releaseDate: Between(dayStart, dayEnd),
            lastUpdated: LessThan(staleThreshold)
          }
        });

        if (eventsCount === 0) {
          missingDates.push(new Date(current));
        } else if (freshEventsCount > 0) {
          staleDates.push(new Date(current));
        }

        current.setDate(current.getDate() + 1);
      }

      const coverage = ((totalDays - missingDates.length - staleDates.length) / totalDays) * 100;
      
      this.logger.log(`Cache coverage for ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}: ${coverage.toFixed(1)}%`);
      
      return { missingDates, staleDates, coverage };

    } catch (error) {
      this.logger.error('Error calculating date range coverage:', error.message);
      return { missingDates: [], staleDates: [], coverage: 0 };
    }
  }

  async clearStaleEvents(): Promise<number> {
    try {
      const staleThreshold = new Date(Date.now() - economicCalendarConfig.cache.ttlHours * 60 * 60 * 1000);
      
      const result = await this.economicEventRepository.delete({
        lastUpdated: LessThan(staleThreshold)
      });

      const deletedCount = result.affected || 0;
      this.logger.log(`Cleared ${deletedCount} stale events from cache`);
      return deletedCount;

    } catch (error) {
      this.logger.error('Error clearing stale events:', error.message);
      return 0;
    }
  }

  async getCacheStats(): Promise<CacheStats> {
    try {
      const totalEvents = await this.economicEventRepository.count();
      
      // Events by importance
      const importanceStats = await this.economicEventRepository
        .createQueryBuilder('event')
        .select('event.importance', 'importance')
        .addSelect('COUNT(*)', 'count')
        .groupBy('event.importance')
        .getRawMany();

      const eventsByImportance = importanceStats.reduce((acc, stat) => {
        acc[stat.importance as EventImportance] = parseInt(stat.count);
        return acc;
      }, {} as Record<EventImportance, number>);

      // Events by country
      const countryStats = await this.economicEventRepository
        .createQueryBuilder('event')
        .select('event.countryCode', 'country')
        .addSelect('COUNT(*)', 'count')
        .groupBy('event.countryCode')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany();

      const eventsByCountry = countryStats.reduce((acc, stat) => {
        acc[stat.country] = parseInt(stat.count);
        return acc;
      }, {} as Record<string, number>);

      // Date range
      const dateRange = await this.economicEventRepository
        .createQueryBuilder('event')
        .select('MIN(event.releaseDate)', 'oldest')
        .addSelect('MAX(event.releaseDate)', 'newest')
        .addSelect('MAX(event.lastUpdated)', 'lastUpdated')
        .getRawOne();

      return {
        totalEvents,
        eventsByImportance,
        eventsByCountry,
        oldestEvent: dateRange.oldest ? new Date(dateRange.oldest) : null,
        newestEvent: dateRange.newest ? new Date(dateRange.newest) : null,
        lastUpdated: dateRange.lastUpdated ? new Date(dateRange.lastUpdated) : null
      };

    } catch (error) {
      this.logger.error('Error getting cache stats:', error.message);
      return {
        totalEvents: 0,
        eventsByImportance: {} as Record<EventImportance, number>,
        eventsByCountry: {},
        oldestEvent: null,
        newestEvent: null,
        lastUpdated: null
      };
    }
  }

  async deleteEventsByDateRange(startDate: Date, endDate: Date): Promise<number> {
    try {
      const result = await this.economicEventRepository.delete({
        releaseDate: Between(startDate, endDate)
      });

      const deletedCount = result.affected || 0;
      this.logger.log(`Deleted ${deletedCount} events for date range ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
      return deletedCount;

    } catch (error) {
      this.logger.error('Error deleting events by date range:', error.message);
      return 0;
    }
  }

  async refreshDateRange(startDate: Date, endDate: Date): Promise<void> {
    try {
      // Clear existing data for the date range
      await this.deleteEventsByDateRange(startDate, endDate);
      
      this.logger.log(`Cleared cache for date range ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]} - ready for refresh`);

    } catch (error) {
      this.logger.error('Error refreshing date range:', error.message);
      throw error;
    }
  }
} 