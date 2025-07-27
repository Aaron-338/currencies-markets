import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

async function testFREDAPI() {
  const apiKey = process.env.FRED_API_KEY;
  
  if (!apiKey) {
    console.log('❌ FRED_API_KEY not found in .env file');
    console.log('💡 Get a free API key at: https://fredaccount.stlouisfed.org/public/datalist/ApiKey');
    return;
  }
  
  console.log('🔑 Testing FRED API with key:', apiKey.substring(0, 8) + '...');
  
  // Test 1: Basic API connectivity with economic releases
  try {
    const releasesUrl = `https://api.stlouisfed.org/fred/releases/dates`;
    const params = {
      api_key: apiKey,
      file_type: 'json',
      limit: 5
    };

    console.log('\n📊 Testing FRED releases endpoint...');
    
    const response = await axios.get(releasesUrl, {
      params,
      timeout: 10000
    });

    if (response.status === 200 && response.data?.release_dates) {
      console.log('✅ FRED API access working');
      console.log(`📅 Recent economic releases: ${response.data.release_dates.length}`);
      
      // Show sample releases
      response.data.release_dates.slice(0, 3).forEach(release => {
        console.log(`   • ${release.release_name} (${release.date})`);
      });
    } else {
      console.log('⚠️ API responded but unexpected format');
    }
  } catch (error) {
    console.log('❌ FRED API test failed:');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.error_message || error.response.statusText}`);
      
      if (error.response.status === 400) {
        console.log('   🔐 Check your API key format');
      } else if (error.response.status === 403) {
        console.log('   🚫 API key may be invalid or expired');
      }
    } else {
      console.log('   Network error:', error.message);
    }
    return;
  }
  
  // Test 2: Get specific economic indicators
  try {
    const seriesUrl = `https://api.stlouisfed.org/fred/series/observations`;
    const params = {
      api_key: apiKey,
      series_id: 'UNRATE', // Unemployment rate
      file_type: 'json',
      limit: 3,
      sort_order: 'desc'
    };

    console.log('\n📈 Testing economic series data (Unemployment Rate)...');
    
    const response = await axios.get(seriesUrl, {
      params,
      timeout: 10000
    });

    if (response.status === 200 && response.data?.observations) {
      console.log('✅ Economic series data accessible');
      console.log('📊 Recent unemployment rates:');
      
      response.data.observations.slice(0, 3).forEach(obs => {
        console.log(`   • ${obs.date}: ${obs.value}%`);
      });
    }
  } catch (error) {
    console.log('❌ Economic series test failed:', error.response?.status || error.message);
  }
  
  // Test 3: Show available economic indicators for your app
  console.log('\n🎯 FRED API Benefits for Your App:');
  console.log('   ✅ Unlimited free API calls');
  console.log('   ✅ Real US economic data (Non-Farm Payrolls, CPI, GDP, etc.)');
  console.log('   ✅ Historical data going back decades');
  console.log('   ✅ Regular updates (monthly/quarterly releases)');
  console.log('   ✅ High-quality Federal Reserve data');
  
  console.log('\n📋 Available Economic Indicators:');
  const indicators = [
    'UNRATE - Unemployment Rate',
    'CPIAUCSL - Consumer Price Index (CPI)',
    'GDP - Gross Domestic Product',
    'PAYEMS - Non-Farm Payrolls',
    'FEDFUNDS - Federal Funds Rate',
    'DGS10 - 10-Year Treasury Rate',
    'DEXUSEU - USD/EUR Exchange Rate',
    'HOUST - Housing Starts',
    'INDPRO - Industrial Production',
    'CPILFESL - Core CPI (Less Food & Energy)'
  ];
  
  indicators.forEach(indicator => {
    console.log(`   • ${indicator}`);
  });
  
  console.log('\n💡 Next Steps:');
  console.log('   1. Add FRED_API_KEY to your .env file');
  console.log('   2. Your economic calendar will use FRED data');
  console.log('   3. FMP API will still work for basic stock quotes');
  console.log('   4. Fallback data available if both APIs fail');
}

// Run the test
testFREDAPI().catch(console.error); 