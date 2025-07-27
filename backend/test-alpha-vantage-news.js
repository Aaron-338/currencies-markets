import axios from 'axios';

// Test Alpha Vantage News API with detailed response analysis
async function testAlphaVantageNews() {
  try {
    console.log('Testing Alpha Vantage News API...\n');
    
    // Using your actual API key
    const apiKey = process.env.ALPHAVANTAGE_API_KEY || 'FIT50D60RIB9X0MC';
    
    const url = 'https://www.alphavantage.co/query';
    
    // Test the exact same parameters your backend is using
    const params = {
      function: 'NEWS_SENTIMENT',
      tickers: 'AAPL,GOOGL,MSFT,AMZN,TSLA,SPY,QQQ,DIA',
      topics: 'finance,trading,stocks',
      limit: 50,
      sort: 'LATEST',
      apikey: apiKey
    };

    console.log('Request URL:', url);
    console.log('Parameters:', params);
    console.log('---\n');

    const response = await axios.get(url, { 
      params,
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'IVREX-Trading-Platform/1.0'
      }
    });

    console.log('✅ Response Status:', response.status);
    console.log('📊 Response Data Type:', typeof response.data);
    console.log('🔑 Response Keys:', Object.keys(response.data || {}).join(', '));
    console.log('---\n');

    // Show complete response structure (first 1000 chars)
    console.log('📄 Complete Response Structure:');
    console.log(JSON.stringify(response.data, null, 2).substring(0, 1000) + '...\n');

    // Specific checks for expected structure
    if (response.data) {
      console.log('🔍 Structure Analysis:');
      console.log(`- Has 'feed' property: ${response.data.hasOwnProperty('feed')}`);
      console.log(`- Has 'Information' property: ${response.data.hasOwnProperty('Information')}`);
      console.log(`- Has 'Error' property: ${response.data.hasOwnProperty('Error')}`);
      
      if (response.data.feed) {
        console.log(`- Feed is array: ${Array.isArray(response.data.feed)}`);
        console.log(`- Feed length: ${response.data.feed?.length || 0}`);
        
        if (Array.isArray(response.data.feed) && response.data.feed.length > 0) {
          console.log('📰 Sample Article Structure:');
          const sample = response.data.feed[0];
          console.log(`- Sample article keys: ${Object.keys(sample).join(', ')}`);
          console.log(`- Title: ${sample.title}`);
          console.log(`- Source: ${sample.source}`);
          console.log(`- URL: ${sample.url}`);
          console.log(`- Time Published: ${sample.time_published}`);
        }
      }
      
      if (response.data.Information) {
        console.log(`ℹ️ API Information: ${response.data.Information}`);
      }
      
      if (response.data.Error) {
        console.log(`❌ API Error: ${response.data.Error}`);
      }
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
    if (error.response) {
      console.error('📄 Error Response Data:', error.response.data);
      console.error('📊 Error Status:', error.response.status);
    }
  }
}

// Test with different API functions
async function testDifferentEndpoints() {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY || 'FIT50D60RIB9X0MC';
  
  console.log('\n=== Testing Different Alpha Vantage Endpoints ===\n');
  
  // Test 1: Basic stock quote (should work)
  try {
    console.log('1. Testing GLOBAL_QUOTE...');
    const quoteResponse = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: 'AAPL',
        apikey: apiKey
      }
    });
    
    if (quoteResponse.data && quoteResponse.data['Global Quote']) {
      console.log('✅ GLOBAL_QUOTE works! Sample:', quoteResponse.data['Global Quote']['01. symbol']);
    } else {
      console.log('❌ GLOBAL_QUOTE response:', quoteResponse.data);
    }
  } catch (error) {
    console.log('❌ GLOBAL_QUOTE error:', error.message);
  }
  
  // Test 2: News Sentiment (might have restrictions)
  try {
    console.log('\n2. Testing NEWS_SENTIMENT...');
    const newsResponse = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'NEWS_SENTIMENT',
        tickers: 'AAPL',
        apikey: apiKey
      }
    });
    
    if (newsResponse.data && newsResponse.data.feed) {
      console.log(`✅ NEWS_SENTIMENT works! Found ${newsResponse.data.feed.length} articles`);
    } else {
      console.log('❌ NEWS_SENTIMENT response:', newsResponse.data);
    }
  } catch (error) {
    console.log('❌ NEWS_SENTIMENT error:', error.message);
  }
}

// Helper functions (copied from service)
function categorizeFinancialNews(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();
  
  if (text.includes('crypto') || text.includes('bitcoin') || text.includes('ethereum')) {
    return 'Crypto';
  }
  if (text.includes('fed') || text.includes('federal reserve') || text.includes('interest rate') || 
      text.includes('inflation') || text.includes('gdp')) {
    return 'Economy';
  }
  if (text.includes('oil') || text.includes('gold') || text.includes('commodity')) {
    return 'Commodities';
  }
  if (text.includes('earnings') || text.includes('revenue') || text.includes('profit')) {
    return 'Earnings';
  }
  
  return 'Markets';
}

function mapAlphaVantageSentiment(label, score) {
  if (!label) return 'neutral';
  
  if (score !== undefined) {
    if (score > 0.1) return 'positive';
    if (score < -0.1) return 'negative';
  }
  
  const labelLower = label.toLowerCase();
  if (labelLower.includes('bullish') || labelLower.includes('positive')) {
    return 'positive';
  }
  if (labelLower.includes('bearish') || labelLower.includes('negative')) {
    return 'negative';
  }
  
  return 'neutral';
}

// Run the tests
console.log('🚀 Starting Alpha Vantage API Tests...\n');
await testAlphaVantageNews();
await testDifferentEndpoints(); 