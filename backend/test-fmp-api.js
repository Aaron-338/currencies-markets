import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

async function testFMPAPI() {
  const apiKey = process.env.FMP_API_KEY;
  
  if (!apiKey) {
    console.log('❌ FMP_API_KEY not found in .env file');
    return;
  }
  
  console.log('🔑 Testing FMP API with key:', apiKey.substring(0, 8) + '...');
  
  // Test 1: Basic API connectivity
  try {
    const testUrl = `https://financialmodelingprep.com/api/v3/quote/AAPL?apikey=${apiKey}`;
    console.log('\n📊 Testing basic quote endpoint...');
    
    const response = await axios.get(testUrl, { timeout: 10000 });
    
    if (response.status === 200 && response.data && response.data.length > 0) {
      console.log('✅ Basic API access working');
      console.log('📈 AAPL Price:', response.data[0].price);
    } else {
      console.log('⚠️ API responded but no data returned');
    }
  } catch (error) {
    console.log('❌ Basic API test failed:');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message || error.response.statusText}`);
      
      if (error.response.status === 401) {
        console.log('   🔐 Invalid API key - check your FMP dashboard');
      } else if (error.response.status === 403) {
        console.log('   🚫 Access forbidden - endpoint may require premium plan');
      } else if (error.response.status === 429) {
        console.log('   ⏱️ Rate limit exceeded - free tier: 250 calls/day');
      }
    } else {
      console.log('   Network error:', error.message);
    }
  }
  
  // Test 2: Economic Calendar (likely to fail on free tier)
  try {
    const economicUrl = `https://financialmodelingprep.com/api/v3/earning_calendar?apikey=${apiKey}`;
    console.log('\n📅 Testing earnings calendar endpoint...');
    
    const response = await axios.get(economicUrl, { timeout: 10000 });
    
    if (response.status === 200) {
      console.log('✅ Earnings calendar accessible');
      console.log(`📊 Events returned: ${response.data?.length || 0}`);
    }
  } catch (error) {
    console.log('❌ Earnings calendar test failed:');
    if (error.response?.status === 403) {
      console.log('   🔒 Earnings calendar requires premium subscription');
      console.log('   💡 Using fallback data instead');
    } else if (error.response?.status === 429) {
      console.log('   ⏱️ Rate limit exceeded');
    } else {
      console.log(`   Status: ${error.response?.status || 'Network error'}`);
    }
  }
  
  // Test 3: Available endpoints for free tier
  console.log('\n🆓 Free Tier Available Endpoints:');
  console.log('   ✅ Stock quotes (limited symbols)');
  console.log('   ✅ Company profiles (AAPL, TSLA, AMZN + 96 more)');
  console.log('   ✅ Historical prices (end-of-day, limited symbols)');
  console.log('   ❌ Economic calendar (premium only)');
  console.log('   ❌ Real-time data (premium only)');
  console.log('   ❌ Advanced fundamentals (premium only)');
  
  console.log('\n💡 Recommendations:');
  console.log('   1. Use FRED API for economic data (free & unlimited)');
  console.log('   2. Rely on fallback data for development');
  console.log('   3. Consider upgrading to Starter plan ($22/mo) for more data');
  console.log('   4. Monitor your daily API usage (250 calls/day limit)');
}

// Run the test
testFMPAPI().catch(console.error); 