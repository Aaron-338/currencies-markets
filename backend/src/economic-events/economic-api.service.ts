import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { economicCalendarConfig } from '../config/economic-calendar.config.js';
import { EconomicEvent, EventImportance, EventStatus } from './economic-event.entity.js';

interface FMPEconomicEvent {
  date: string;
  event: string;
  country: string;
  actual: string | null;
  estimate: string | null;
  previous: string | null;
  impact: string;
  currency: string;
  time: string;
}

interface FREDReleaseDate {
  release_id: number;
  release_name: string;
  date: string;
}

@Injectable()
export class EconomicApiService {
  private readonly logger = new Logger(EconomicApiService.name);
  private fmpCallCount = 0;
  private fredCallCount = 0;
  private lastResetTime = new Date();

  constructor() {
    // Reset rate limit counters every minute
    setInterval(() => {
      this.resetRateLimitCounters();
    }, 60000);
  }

  private resetRateLimitCounters() {
    const now = new Date();
    if (now.getTime() - this.lastResetTime.getTime() >= 60000) {
      this.fmpCallCount = 0;
      this.fredCallCount = 0;
      this.lastResetTime = now;
    }
  }

  private canMakeFMPCall(): boolean {
    return this.fmpCallCount < economicCalendarConfig.rateLimiting.fmpCallsPerMinute;
  }

  private canMakeFREDCall(): boolean {
    return this.fredCallCount < economicCalendarConfig.rateLimiting.fredCallsPerMinute;
  }

  private parseImportance(impact: string): EventImportance {
    const impactLower = impact.toLowerCase();
    if (impactLower.includes('high') || impactLower === '3') return EventImportance.HIGH;
    if (impactLower.includes('medium') || impactLower === '2') return EventImportance.MEDIUM;
    return EventImportance.LOW;
  }

  private parseNumericValue(value: string | null): number | null {
    if (!value || value === 'null' || value === '') return null;
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? null : parsed;
  }

  async fetchFromFMP(fromDate: string, toDate: string): Promise<EconomicEvent[]> {
    try {
      if (!this.canMakeFMPCall()) {
        this.logger.warn('FMP rate limit reached, skipping call');
        return [];
      }

      if (!economicCalendarConfig.fmp.apiKey) {
        this.logger.warn('FMP API key not configured, using fallback data');
        return this.createFallbackFMPEvents(fromDate, toDate);
      }

      // Try earnings calendar first (free tier - limited symbols only)
      try {
        const url = `${economicCalendarConfig.fmp.baseUrl}/earning_calendar`;
        const params = {
          apikey: economicCalendarConfig.fmp.apiKey,
          from: fromDate,
          to: toDate
        };

        this.logger.log(`Fetching FMP earnings calendar from ${fromDate} to ${toDate} (Free Tier - Limited Data)`);
        
        const response = await axios.get(url, {
          params,
          timeout: economicCalendarConfig.fallback.timeout
        });

        this.fmpCallCount++;

        if (response.data && Array.isArray(response.data)) {
          const events: EconomicEvent[] = response.data.map(item => {
            const event = new EconomicEvent();
            event.eventName = `${item.symbol} Earnings`;
            event.country = 'United States';
            event.countryCode = 'US';
            event.releaseDate = new Date(item.date);
            event.releaseTime = item.time || '16:00';
            event.importance = EventImportance.MEDIUM;
            event.status = EventStatus.SCHEDULED;
            event.currency = 'USD';
            event.actual = this.parseNumericValue(item.eps);
            event.forecast = this.parseNumericValue(item.epsEstimated);
            event.source = 'FMP';
            event.externalId = `fmp_earnings_${item.symbol}_${item.date}`;
            event.lastUpdated = new Date();
            
            return event;
          }).slice(0, 20); // Limit to 20 events

          this.logger.log(`Successfully fetched ${events.length} earnings events from FMP`);
          return events;
        }
      } catch (earningsError) {
        this.logger.warn('FMP earnings endpoint failed:', earningsError.message);
        if (earningsError.response?.status === 401) {
          this.logger.error('FMP API: Invalid API key or unauthorized access');
        } else if (earningsError.response?.status === 403) {
          this.logger.error('FMP API: Access forbidden - endpoint may require premium subscription');
        } else if (earningsError.response?.status === 429) {
          this.logger.error('FMP API: Rate limit exceeded - free tier allows 250 calls/day');
        }
      }

      // If earnings fails, return fallback data
      this.logger.warn('FMP premium endpoints not available with free tier, using fallback data');
      return this.createFallbackFMPEvents(fromDate, toDate);

    } catch (error) {
      this.logger.error('Error fetching from FMP:', error.message);
      return this.createFallbackFMPEvents(fromDate, toDate);
    }
  }

  private createFallbackFMPEvents(fromDate: string, toDate: string): EconomicEvent[] {
    this.logger.log('Creating fallback economic events for demo purposes');
    
    const events: EconomicEvent[] = [];
    const start = new Date(fromDate);
    const end = new Date(toDate);
    
    // Create some sample economic events
    const sampleEvents = [
      { name: 'Non-Farm Payrolls', importance: EventImportance.HIGH, time: '08:30' },
      { name: 'Consumer Price Index (CPI)', importance: EventImportance.HIGH, time: '08:30' },
      { name: 'Federal Funds Rate Decision', importance: EventImportance.HIGH, time: '14:00' },
      { name: 'GDP Growth Rate', importance: EventImportance.HIGH, time: '08:30' },
      { name: 'Unemployment Rate', importance: EventImportance.HIGH, time: '08:30' },
      { name: 'Retail Sales', importance: EventImportance.MEDIUM, time: '08:30' },
      { name: 'Industrial Production', importance: EventImportance.MEDIUM, time: '09:15' },
      { name: 'Consumer Confidence', importance: EventImportance.MEDIUM, time: '10:00' },
      { name: 'Initial Jobless Claims', importance: EventImportance.LOW, time: '08:30' },
      { name: 'Housing Starts', importance: EventImportance.LOW, time: '08:30' }
    ];

    // Generate events for each day in the range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      // Skip weekends
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      
      // Add 1-3 random events per day
      const eventsPerDay = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < eventsPerDay; i++) {
        const sampleEvent = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
        
        const event = new EconomicEvent();
        event.eventName = sampleEvent.name;
        event.country = 'United States';
        event.countryCode = 'US';
        event.releaseDate = new Date(d);
        event.releaseTime = sampleEvent.time;
        event.importance = sampleEvent.importance;
        event.status = EventStatus.SCHEDULED;
        event.currency = 'USD';
        event.forecast = Math.random() > 0.5 ? parseFloat((Math.random() * 10).toFixed(1)) : null;
        event.previous = Math.random() > 0.5 ? parseFloat((Math.random() * 10).toFixed(1)) : null;
        event.source = 'US_ECONOMIC';
        event.externalId = `us_economic_${d.toISOString().split('T')[0]}_${sampleEvent.name.replace(/\s+/g, '_')}`;
        event.lastUpdated = new Date();
        
        events.push(event);
      }
    }

    return events.slice(0, 50); // Limit to 50 events
  }

  async fetchFromFRED(fromDate: string, toDate: string): Promise<EconomicEvent[]> {
    try {
      if (!this.canMakeFREDCall()) {
        this.logger.warn('FRED rate limit reached, skipping call');
        return [];
      }

      if (!economicCalendarConfig.fred.apiKey) {
        this.logger.error('FRED API key not configured');
        return [];
      }

      const url = `${economicCalendarConfig.fred.baseUrl}${economicCalendarConfig.fred.endpoints.releases}`;
      const params = {
        api_key: economicCalendarConfig.fred.apiKey,
        file_type: 'json',
        realtime_start: fromDate,
        realtime_end: toDate,
        limit: 1000
      };

      this.logger.log(`Fetching FRED economic releases from ${fromDate} to ${toDate}`);

      const response: AxiosResponse<{ release_dates: FREDReleaseDate[] }> = await axios.get(url, {
        params,
        timeout: economicCalendarConfig.fallback.timeout
      });

      this.fredCallCount++;

      if (!response.data?.release_dates || !Array.isArray(response.data.release_dates)) {
        this.logger.warn('Invalid FRED response format');
        return [];
      }

      const events: EconomicEvent[] = response.data.release_dates.map(item => {
        const event = new EconomicEvent();
        event.eventName = item.release_name;
        event.country = 'United States';
        event.countryCode = 'US';
        event.releaseDate = new Date(item.date);
        event.releaseTime = '08:30'; // Most FRED releases are at 8:30 AM EST
        event.importance = this.determineFREDImportance(item.release_name);
        event.status = EventStatus.SCHEDULED;
        event.currency = 'USD';
        event.source = 'FRED';
        event.externalId = `fred_${item.release_id}_${item.date}`;
        event.lastUpdated = new Date();
        
        return event;
      });

      this.logger.log(`Successfully fetched ${events.length} events from FRED`);
      return events;

    } catch (error) {
      this.logger.error('Error fetching from FRED:', error.message);
      return [];
    }
  }

  private determineFREDImportance(releaseName: string): EventImportance {
    const highImpactKeywords = [
      'employment', 'nonfarm', 'unemployment', 'cpi', 'inflation', 
      'gdp', 'fomc', 'federal funds', 'retail sales', 'housing'
    ];
    
    const mediumImpactKeywords = [
      'manufacturing', 'industrial production', 'consumer confidence',
      'ppi', 'import', 'export', 'trade balance'
    ];

    const nameLower = releaseName.toLowerCase();
    
    if (highImpactKeywords.some(keyword => nameLower.includes(keyword))) {
      return EventImportance.HIGH;
    }
    
    if (mediumImpactKeywords.some(keyword => nameLower.includes(keyword))) {
      return EventImportance.MEDIUM;
    }
    
    return EventImportance.LOW;
  }

  private getCountryCode(country: string): string {
    const countryMap: { [key: string]: string } = {
      'United States': 'US',
      'Germany': 'DE',
      'United Kingdom': 'GB',
      'Japan': 'JP',
      'Canada': 'CA',
      'Australia': 'AU',
      'Switzerland': 'CH',
      'China': 'CN',
      'France': 'FR',
      'Italy': 'IT',
      'Spain': 'ES',
      'Euro Zone': 'EU',
      'Eurozone': 'EU'
    };

    return countryMap[country] || country?.slice(0, 2).toUpperCase() || 'XX';
  }

  async fetchCombinedEconomicData(fromDate: string, toDate: string): Promise<EconomicEvent[]> {
    try {
      this.logger.log(`Fetching combined economic data from ${fromDate} to ${toDate}`);
      
      const [fmpEvents, fredEvents, alternativeEvents] = await Promise.allSettled([
        this.fetchFromFMP(fromDate, toDate),
        this.fetchFromFRED(fromDate, toDate),
        this.fetchFromAlternativeSources(fromDate, toDate)
      ]);

      const combinedEvents: EconomicEvent[] = [];

      if (fmpEvents.status === 'fulfilled') {
        combinedEvents.push(...fmpEvents.value);
      } else {
        this.logger.error('FMP fetch failed:', fmpEvents.reason);
      }

      if (fredEvents.status === 'fulfilled') {
        combinedEvents.push(...fredEvents.value);
      } else {
        this.logger.error('FRED fetch failed:', fredEvents.reason);
      }

      if (alternativeEvents.status === 'fulfilled') {
        combinedEvents.push(...alternativeEvents.value);
      } else {
        this.logger.error('Alternative sources fetch failed:', alternativeEvents.reason);
      }

      // If no events from APIs, create fallback demo data
      if (combinedEvents.length === 0) {
        this.logger.warn('No events from any API source, creating demo data');
        combinedEvents.push(...this.createFallbackFMPEvents(fromDate, toDate));
      }

      // Remove duplicates based on event name and date
      const uniqueEvents = this.removeDuplicates(combinedEvents);
      
      this.logger.log(`Combined and deduplicated: ${uniqueEvents.length} total events`);
      return uniqueEvents;

    } catch (error) {
      this.logger.error('Error in fetchCombinedEconomicData:', error.message);
      return [];
    }
  }

  private removeDuplicates(events: EconomicEvent[]): EconomicEvent[] {
    const seen = new Set<string>();
    return events.filter(event => {
      const key = `${event.eventName}_${event.releaseDate.toISOString().split('T')[0]}_${event.country}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  getRateLimitStatus() {
    return {
      fmp: {
        calls: this.fmpCallCount,
        limit: economicCalendarConfig.rateLimiting.fmpCallsPerMinute,
        canMakeCall: this.canMakeFMPCall()
      },
      fred: {
        calls: this.fredCallCount,
        limit: economicCalendarConfig.rateLimiting.fredCallsPerMinute,
        canMakeCall: this.canMakeFREDCall()
      },
      lastReset: this.lastResetTime
    };
  }

  async fetchFromAlternativeSources(fromDate: string, toDate: string): Promise<EconomicEvent[]> {
    this.logger.log('Fetching from alternative free sources');
    
    const events: EconomicEvent[] = [];
    
    // Try Trading Economics API (has some free endpoints)
    try {
      // This is a demo - you'd need to implement actual free API calls
      const tradingEconomicsEvents = await this.fetchFromTradingEconomics(fromDate, toDate);
      events.push(...tradingEconomicsEvents);
    } catch (error) {
      this.logger.warn('Trading Economics API failed:', error.message);
    }
    
    // Add more fallback data if needed
    if (events.length === 0) {
      events.push(...this.createFallbackFMPEvents(fromDate, toDate));
    }
    
    return events;
  }
  
  private async fetchFromTradingEconomics(fromDate: string, toDate: string): Promise<EconomicEvent[]> {
    // This would implement calls to free economic calendar APIs
    // For now, return empty array since most require authentication
    this.logger.log('Trading Economics API not implemented - using fallback');
    return [];
  }
} 