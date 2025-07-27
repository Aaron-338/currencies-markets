# Marketaux API Setup Guide

## Overview
The IVREX platform now uses Marketaux API as the primary source for real-time financial market news. This provides high-quality, real-time news with advanced filtering and entity recognition.

## Setup Instructions

### 1. Get Your API Token
1. Visit [Marketaux.com](https://www.marketaux.com/)
2. Sign up for an account (they offer free tiers)
3. Get your API token from the dashboard

### 2. Configure Environment Variable
Add your API token to your backend `.env` file:

```bash
MARKETAUX_API_TOKEN=your_actual_api_token_here
```

### 3. Restart the Backend Server
After adding the token, restart your backend server:

```bash
cd backend
npm run start:dev
```

## API Features

### What Marketaux Provides:
- **Real-time News**: Latest financial news from multiple sources
- **Entity Recognition**: Automatically identifies companies, stocks, and topics
- **Sentiment Analysis**: AI-powered sentiment scoring
- **Advanced Filtering**: Filter by country, entity, date, etc.
- **High-Quality Sources**: Curated financial news sources

### Current Configuration:
- **Countries**: US (can be expanded)
- **Entities**: Filtered for relevance
- **Limit**: 20 articles per request
- **Time Range**: Last 24 hours
- **Language**: English

## Backup Sources
If Marketaux is unavailable, the system automatically falls back to:
1. Alpha Vantage News API
2. News API
3. Static fallback content

## API Limits
- Check your Marketaux plan for request limits
- The system includes built-in rate limiting
- Force refresh bypasses normal rate limits for manual updates

## Testing
1. Add your API token to the `.env` file
2. Restart the backend
3. Go to the frontend home page
4. Check the "Latest Market News" section
5. Click "Refresh" to test real-time updates

## Troubleshooting

### No News Appearing:
1. Check that `MARKETAUX_API_TOKEN` is set in your `.env` file
2. Verify the token is valid by checking the Marketaux dashboard
3. Check backend logs for error messages
4. Ensure the backend server restarted after adding the token

### API Errors:
- Check backend console for detailed error messages
- Verify your API plan hasn't exceeded limits
- Test the API directly: `https://api.marketaux.com/v1/news/all?api_token=YOUR_TOKEN&limit=5`

## Example API Response
The system automatically processes Marketaux responses and converts them to our internal format with:
- Title and description
- Publication date and source
- Category classification (Economy, Crypto, Technology, etc.)
- Sentiment analysis (positive/negative/neutral)
- High-quality images when available 