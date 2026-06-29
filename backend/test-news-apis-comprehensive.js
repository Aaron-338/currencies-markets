#!/usr/bin/env node

/**
 * Comprehensive News API Testing Script
 * Tests all three news sources: Alpha Vantage, Marketaux, and News API
 */

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

class NewsAPITester {
  constructor() {
    this.alphaVantageKey = process.env.ALPHAVANTAGE_API_KEY || '';
    this.marketauxKey = process.env.MARKETAUX_API_TOKEN || '';
    this.newsApiKey = process.env.NEWS_API_KEY || '';
  }

  async runComprehensiveTests() {
    console.log('🧪 Comprehensive News API Testing\n');
    
    console.log('🔑 API Keys Status:');
    console.log(`   Alpha Vantage: ${this.alphaVantageKey ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   Marketaux: ${this.marketauxKey ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   NewsAPI.org: ${this.newsApiKey ? '✅ Configured' : '❌ Missing'}\n`);

    // Test each API source
    await this.testAlphaVantageAPI();
    await this.testMarketauxAPI(); 
    await this.testNewsAPIOrg();
    
    // Test the backend integration
    await this.testBackendIntegration();
    
    // Generate recommendations
    this.generateRecommendations();
  }

  async testAlphaVantageAPI() {
    console.log('📰 Testing Alpha Vantage News API...');
    
    if (!this.alphaVantageKey) {
      console.log('   ❌ No API key configured\n');
      return;
    }

    try {
      // Test with correct parameters
      const url = 'https://www.alphavantage.co/query';
      const params = {
        function: 'NEWS_SENTIMENT',
        tickers: 'AAPL', // Single ticker works better than multiple
        apikey: this.alphaVantageKey
      };

      console.log('   🔄 Testing with correct parameters...');
      const response = await axios.get(url, { params, timeout: 10000 });

      if (response.data?.feed && Array.isArray(response.data.feed)) {
        console.log(`   ✅ SUCCESS: Retrieved ${response.data.feed.length} articles`);
        
        if (response.data.feed.length > 0) {
          const sample = response.data.feed[0];
          console.log(`   📄 Sample article: "${sample.title}"`);
          console.log(`   📅 Published: ${sample.time_published}`);
          console.log(`   🏷️ Sentiment: ${sample.overall_sentiment_label} (${sample.overall_sentiment_score})`);
        }
      } else if (response.data?.Information) {
        console.log(`   ⚠️ API Response: ${response.data.Information}`);
      } else {
        console.log('   ❌ Unexpected response format');
        console.log(`   📄 Response keys: ${Object.keys(response.data || {}).join(', ')}`);
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.response?.data) {
        console.log(`   📄 Error details: ${JSON.stringify(error.response.data)}`);
      }
    }
    console.log('');
  }

  async testMarketauxAPI() {
    console.log('📈 Testing Marketaux API...');
    
    if (!this.marketauxKey) {
      console.log('   ❌ No API key configured\n');
      return;
    }

    try {
      const url = 'https://api.marketaux.com/v1/news/all';
      const publishedAfter = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const params = {
        api_token: this.marketauxKey,
        countries: 'us',
        filter_entities: 'true',
        limit: 10,
        published_after: publishedAfter,
        language: 'en'
      };

      console.log('   🔄 Testing with correct parameters...');
      const response = await axios.get(url, { 
        params, 
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'IVREX-Trading-Platform/1.0'
        }
      });

      if (response.data?.data && Array.isArray(response.data.data)) {
        console.log(`   ✅ SUCCESS: Retrieved ${response.data.data.length} articles`);
        console.log(`   📊 Meta: ${response.data.meta?.found} found, ${response.data.meta?.returned} returned`);
        
        if (response.data.data.length > 0) {
          const sample = response.data.data[0];
          console.log(`   📄 Sample article: "${sample.title}"`);
          console.log(`   📰 Source: ${sample.source}`);
          console.log(`   🏷️ Entities: ${sample.entities?.length || 0} financial entities`);
        }
      } else {
        console.log('   ❌ Unexpected response format');
        console.log(`   📄 Response keys: ${Object.keys(response.data || {}).join(', ')}`);
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.response?.status === 401) {
        console.log('   🔐 Invalid API token - check your Marketaux dashboard');
      } else if (error.response?.status === 429) {
        console.log('   ⏱️ Rate limit exceeded');
      } else if (error.response?.data) {
        console.log(`   📄 Error details: ${JSON.stringify(error.response.data)}`);
      }
    }
    console.log('');
  }

  async testNewsAPIOrg() {
    console.log('🗞️ Testing NewsAPI.org...');
    
    if (!this.newsApiKey) {
      console.log('   ❌ No API key configured\n');
      return;
    }

    try {
      const url = 'https://newsapi.org/v2/everything';
      const params = {
        q: 'finance OR trading OR stocks OR economy',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 10,
        apiKey: this.newsApiKey
      };

      console.log('   🔄 Testing with correct parameters...');
      const response = await axios.get(url, { params, timeout: 10000 });

      if (response.data?.articles && Array.isArray(response.data.articles)) {
        console.log(`   ✅ SUCCESS: Retrieved ${response.data.articles.length} articles`);
        console.log(`   📊 Total results: ${response.data.totalResults}`);
        
        if (response.data.articles.length > 0) {
          const sample = response.data.articles[0];
          console.log(`   📄 Sample article: "${sample.title}"`);
          console.log(`   📰 Source: ${sample.source.name}`);
          console.log(`   📅 Published: ${sample.publishedAt}`);
        }
      } else {
        console.log('   ❌ Unexpected response format');
        console.log(`   📄 Response keys: ${Object.keys(response.data || {}).join(', ')}`);
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.response?.status === 401) {
        console.log('   🔐 Invalid API key - check your NewsAPI.org dashboard');
      } else if (error.response?.status === 429) {
        console.log('   ⏱️ Rate limit exceeded - free tier: 1000 requests/month');
      } else if (error.response?.data) {
        console.log(`   📄 Error details: ${JSON.stringify(error.response.data)}`);
      }
    }
    console.log('');
  }

  async testBackendIntegration() {
    console.log('🔧 Testing Backend Integration...');
    
    try {
      // Test the public endpoint (should work without auth)
      const response = await axios.get('http://localhost:3002/market-news/public', {
        params: { limit: 3 },
        timeout: 10000
      });

      if (response.data?.success && response.data?.data) {
        console.log(`   ✅ Backend API working: ${response.data.count} articles returned`);
        
        if (response.data.data.length > 0) {
          const sample = response.data.data[0];
          console.log(`   📄 Sample: "${sample.title}"`);
          console.log(`   🏷️ Category: ${sample.category}`);
          console.log(`   📰 Source: ${sample.source}`);
          
          // Check if it's fallback data
          if (sample.id.startsWith('fallback_')) {
            console.log('   ⚠️ Using fallback data (APIs may not be working)');
          } else {
            console.log('   ✅ Real API data detected');
          }
        }
      } else {
        console.log('   ❌ Backend API response format issue');
      }

    } catch (error) {
      console.log(`   ❌ Backend integration error: ${error.message}`);
      if (error.code === 'ECONNREFUSED') {
        console.log('   🚨 Backend server not running - start with: npm run start:dev');
      }
    }
    console.log('');
  }

  generateRecommendations() {
    console.log('💡 Recommendations & Next Steps:\n');
    
    console.log('🎯 Immediate Actions:');
    
    if (!this.alphaVantageKey) {
      console.log('   1. ❗ Get Alpha Vantage API key (free, 500 calls/day)');
      console.log('      📄 Visit: https://www.alphavantage.co/support/#api-key');
    } else {
      console.log('   1. ✅ Alpha Vantage configured');
    }
    
    if (!this.marketauxKey) {
      console.log('   2. ❗ Get Marketaux API token (free tier available)');
      console.log('      📄 Visit: https://www.marketaux.com/pricing');
    } else {
      console.log('   2. ✅ Marketaux configured');
    }
    
    if (!this.newsApiKey) {
      console.log('   3. ❗ Get NewsAPI.org key (free, 1000 calls/month)');
      console.log('      📄 Visit: https://newsapi.org/register');
    } else {
      console.log('   3. ✅ NewsAPI.org configured');
    }

    console.log('\n🔧 Technical Fixes Needed:');
    console.log('   1. Fix Alpha Vantage API parameters in news-api.service.ts');
    console.log('   2. Improve error handling for rate limits');
    console.log('   3. Add better fallback data rotation');
    console.log('   4. Implement smart caching to reduce API calls');

    console.log('\n📊 API Comparison:');
    console.log('   Alpha Vantage: Best for US financial news + sentiment');
    console.log('   Marketaux: Best for real-time global financial news');
    console.log('   NewsAPI.org: Good general backup, limited free tier');
    console.log('   Fallback: Always available, realistic demo data');

    console.log('\n🚀 Priority Setup:');
    console.log('   Primary: Alpha Vantage (financial focus, sentiment)');
    console.log('   Secondary: Marketaux (global coverage, real-time)');
    console.log('   Tertiary: NewsAPI.org (general news backup)');
    console.log('   Always: Enhanced fallback system');
  }
}

// Run the comprehensive tests
const tester = new NewsAPITester();
tester.runComprehensiveTests().catch(console.error);