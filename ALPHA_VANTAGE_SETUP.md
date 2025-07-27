# Alpha Vantage News API Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your Free API Key
1. Go to [Alpha Vantage API Key Request](https://www.alphavantage.co/support/#api-key)
2. Enter your email address
3. You'll get a free API key with **500 requests/day**
4. **No credit card required!**

### Step 2: Set Environment Variable
Add this to your backend environment variables:

```bash
# In your .env file or environment
ALPHAVANTAGE_API_KEY=your_actual_api_key_here
```

### Step 3: Restart Your Backend
```bash
cd backend
npm run start:dev
```

## ✅ Verify It's Working

### Test the API Endpoint
```bash
# Test your backend news endpoint
curl http://localhost:3002/market-news?limit=3
```

You should see real financial news instead of static content!

## 🎯 What You Get

### Real Financial News
- **500 articles/day** free
- **Live breaking news** from major financial sources
- **AI sentiment analysis** (positive/negative/neutral)
- **Smart categorization** (Economy, Crypto, Commodities, etc.)

### Enhanced Features
- **Financial focus**: Fed policy, earnings, inflation, market trends
- **Major tickers**: AAPL, GOOGL, MSFT, SPY automatically tracked
- **Fallback system**: If API fails, shows static content
- **Rate limiting**: Respects API limits automatically

## 📊 Example API Response

```json
{
  "success": true,
  "data": [
    {
      "id": "alpha_1234567890",
      "title": "Federal Reserve Holds Interest Rates Steady",
      "summary": "The Federal Reserve announced today that it will maintain current interest rates...",
      "url": "https://example.com/news/fed-rates",
      "publishedAt": "2024-01-15T14:30:00Z",
      "source": "Reuters",
      "category": "Economy",
      "imageUrl": "https://images.unsplash.com/photo-1611974789855...",
      "sentiment": "neutral"
    }
  ],
  "count": 3
}
```

## 🔧 Customization Options

### Modify Topics
Edit `backend/src/market-news/news-api.service.ts` line ~120:

```javascript
const financialTopics = [
  'finance', 'economy', 'stock market', 'federal reserve', 
  'inflation', 'GDP', 'unemployment', 'interest rates',
  'cryptocurrency', 'bitcoin', 'earnings', 'trading'
  // Add your custom topics here
];
```

### Modify Tickers
Edit the same file line ~130:

```javascript
tickers: 'AAPL,GOOGL,MSFT,AMZN,TSLA,SPY,QQQ,DIA,BTC-USD'
// Add your preferred stock symbols
```

## 🚨 Troubleshooting

### Common Issues

1. **"Using fallback data"**
   - Check your API key is set correctly
   - Verify you haven't exceeded 500 requests/day
   - Check internet connection

2. **"Alpha Vantage API fetch failed"**
   - API key might be invalid
   - Check the logs for specific error messages

3. **Still showing static content**
   - Make sure backend is restarted after setting API key
   - Check browser cache - try hard refresh (Ctrl+F5)

### Debug Commands
```bash
# Check if API key is set
echo $ALPHAVANTAGE_API_KEY

# Check backend logs
cd backend
npm run start:dev

# Test API directly
node test-alpha-vantage-news.js
```

## 💡 Pro Tips

1. **Monitor Usage**: Check your daily request count at Alpha Vantage dashboard
2. **Cache Results**: News updates every few hours, so caching helps
3. **Backup Sources**: The system automatically falls back to Marketaux and News API
4. **Categories**: News is auto-categorized into Economy, Crypto, Markets, etc.

## 📈 Upgrade Options

- **25 requests/minute**: $49.99/month
- **75 requests/minute**: $149.99/month
- **Unlimited**: Contact sales

For most applications, the **free tier (500/day)** is perfect!

---

## 🎉 Next Steps

Once setup:
1. Your homepage will show **real financial news**
2. **Sentiment indicators** will help users gauge market mood
3. **Categories** will organize news by topic
4. **Auto-refresh** keeps content fresh

Ready to transform your static news into dynamic financial intelligence! 🚀 