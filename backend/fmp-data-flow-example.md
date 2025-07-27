# How FMP Data Flows Through Your System

## 1. API Call to FMP
```javascript
const url = `${economicCalendarConfig.fmp.baseUrl}/earning_calendar`;
const params = {
  apikey: economicCalendarConfig.fmp.apiKey,
  from: fromDate, // e.g., "2025-07-21"
  to: toDate      // e.g., "2025-07-28"
};
```

## 2. Raw FMP Response (Example)
```json
[
  {
    "symbol": "AAPL",
    "date": "2025-07-22",
    "time": "16:00",
    "eps": 1.52,
    "epsEstimated": 1.48,
    "revenue": 81800000000,
    "revenueEstimated": 81200000000
  },
  {
    "symbol": "TSLA", 
    "date": "2025-07-23",
    "time": "17:00",
    "eps": 0.85,
    "epsEstimated": 0.82,
    "revenue": 24500000000,
    "revenueEstimated": 24200000000
  }
]
```

## 3. Data Transformation to Economic Events
```javascript
const events = response.data.map(item => {
  const event = new EconomicEvent();
  event.eventName = `${item.symbol} Earnings`;           // "AAPL Earnings"
  event.country = 'United States';                       // Always US
  event.countryCode = 'US';                             // Always US
  event.releaseDate = new Date(item.date);             // 2025-07-22
  event.releaseTime = item.time || '16:00';            // "16:00"
  event.importance = EventImportance.MEDIUM;           // Always MEDIUM
  event.status = EventStatus.SCHEDULED;                // Always SCHEDULED
  event.currency = 'USD';                              // Always USD
  event.actual = parseNumericValue(item.eps);          // 1.52
  event.forecast = parseNumericValue(item.epsEstimated); // 1.48
  event.source = 'FMP';                                // Source identifier
  event.externalId = `fmp_earnings_${item.symbol}_${item.date}`; // Unique ID
  event.lastUpdated = new Date();                      // Current timestamp
  
  return event;
}).slice(0, 20); // Limit to 20 events
```

## 4. Final Economic Event Object
```json
{
  "id": "generated_by_database",
  "eventName": "AAPL Earnings",
  "country": "United States", 
  "countryCode": "US",
  "releaseDate": "2025-07-22T00:00:00.000Z",
  "releaseTime": "16:00:00",
  "importance": "medium",
  "status": "scheduled",
  "currency": "USD",
  "actual": 1.52,
  "forecast": 1.48,
  "previous": null,
  "source": "FMP",
  "externalId": "fmp_earnings_AAPL_2025-07-22",
  "lastUpdated": "2025-07-21T10:30:00.000Z"
}
```

## 5. Integration with Other Sources
```javascript
// Combined data from multiple sources
const [fmpEvents, fredEvents, alternativeEvents] = await Promise.allSettled([
  this.fetchFromFMP(fromDate, toDate),        // ~5-20 earnings events
  this.fetchFromFRED(fromDate, toDate),       // ~50-100 economic releases
  this.fetchFromAlternativeSources(fromDate, toDate) // Fallback data
]);

// Merge all sources
const combinedEvents = [];
if (fmpEvents.status === 'fulfilled') {
  combinedEvents.push(...fmpEvents.value);    // Add FMP earnings
}
if (fredEvents.status === 'fulfilled') {
  combinedEvents.push(...fredEvents.value);   // Add FRED economic data
}
```

## 6. What You Get in Your Frontend
```json
{
  "success": true,
  "data": [
    {
      "eventName": "AAPL Earnings",
      "country": "United States",
      "releaseDate": "2025-07-22",
      "releaseTime": "16:00:00", 
      "importance": "medium",
      "actual": 1.52,
      "forecast": 1.48,
      "source": "FMP"
    },
    {
      "eventName": "Non-Farm Payrolls",
      "country": "United States",
      "releaseDate": "2025-07-22",
      "releaseTime": "08:30:00",
      "importance": "high", 
      "source": "FRED"
    }
  ]
}
``` 