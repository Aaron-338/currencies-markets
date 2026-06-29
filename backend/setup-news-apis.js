#!/usr/bin/env node

/**
 * News API Setup Helper
 * Helps configure the three news API services for the economic news system
 */

import fs from 'fs';
import path from 'path';

class NewsAPISetup {
  constructor() {
    this.envPath = path.join(process.cwd(), '.env');
  }

  displaySetupGuide() {
    console.log('🗞️ News API Setup Guide\n');
    
    console.log('Your economic news system uses 3 API sources in priority order:\n');
    
    console.log('1. 📰 Alpha Vantage (PRIMARY - Recommended)');
    console.log('   • Best for: Financial news with sentiment analysis');
    console.log('   • Free tier: 500 calls/day');
    console.log('   • Sign up: https://www.alphavantage.co/support/#api-key');
    console.log('   • Features: News sentiment, real-time financial data');
    console.log('   • Add to .env: ALPHAVANTAGE_API_KEY=your_key_here\n');
    
    console.log('2. 📈 Marketaux (SECONDARY - Optional but Recommended)');
    console.log('   • Best for: Real-time global financial news');
    console.log('   • Free tier: 100 calls/month');
    console.log('   • Sign up: https://www.marketaux.com/pricing');
    console.log('   • Features: Entity detection, real-time updates');
    console.log('   • Add to .env: MARKETAUX_API_TOKEN=your_token_here\n');
    
    console.log('3. 🌐 NewsAPI.org (TERTIARY - General backup)');
    console.log('   • Best for: General news backup');
    console.log('   • Free tier: 1000 calls/month');
    console.log('   • Sign up: https://newsapi.org/register');
    console.log('   • Features: Broad news coverage');
    console.log('   • Add to .env: NEWS_API_KEY=your_key_here\n');
    
    console.log('4. ✨ Enhanced Fallback (ALWAYS AVAILABLE)');
    console.log('   • Realistic financial news templates');
    console.log('   • Daily rotating content');
    console.log('   • No API dependencies');
    console.log('   • Automatically used when APIs fail\n');
  }

  generateEnvTemplate() {
    const envTemplate = `
# News API Configuration
# Add your API keys below - get them from the signup links above

# Alpha Vantage (Primary news source - RECOMMENDED)
# Get free key: https://www.alphavantage.co/support/#api-key
ALPHAVANTAGE_API_KEY=

# Marketaux (Secondary news source - Optional)  
# Get free token: https://www.marketaux.com/pricing
MARKETAUX_API_TOKEN=

# NewsAPI.org (Tertiary news source - Optional)
# Get free key: https://newsapi.org/register  
NEWS_API_KEY=

# Note: System works with enhanced fallback even without API keys
# But real APIs provide better, up-to-date financial news
`;

    console.log('📝 Environment Template:');
    console.log(envTemplate);
    
    return envTemplate;
  }

  async addKeysToEnv() {
    console.log('🔧 Interactive API Key Setup\n');
    
    // Read existing .env file
    let envContent = '';
    try {
      envContent = fs.readFileSync(this.envPath, 'utf8');
    } catch (error) {
      console.log('📄 Creating new .env file...');
    }

    console.log('Enter your API keys (press Enter to skip):\n');

    // This would be interactive in a real script
    // For now, show the template
    console.log('Copy this template to your .env file:');
    this.generateEnvTemplate();
  }

  checkCurrentSetup() {
    console.log('🔍 Checking Current Setup...\n');
    
    try {
      const envContent = fs.readFileSync(this.envPath, 'utf8');
      
      const hasAlphaVantage = /ALPHAVANTAGE_API_KEY=.+/.test(envContent);
      const hasMarketaux = /MARKETAUX_API_TOKEN=.+/.test(envContent);
      const hasNewsAPI = /NEWS_API_KEY=.+/.test(envContent);
      
      console.log('📊 Current API Configuration:');
      console.log(`   Alpha Vantage: ${hasAlphaVantage ? '✅ Configured' : '❌ Missing'}`);
      console.log(`   Marketaux: ${hasMarketaux ? '✅ Configured' : '❌ Missing'}`);
      console.log(`   NewsAPI.org: ${hasNewsAPI ? '✅ Configured' : '❌ Missing'}`);
      
      if (!hasAlphaVantage && !hasMarketaux && !hasNewsAPI) {
        console.log('\n⚠️ No news APIs configured - using enhanced fallback only');
        console.log('💡 Add at least Alpha Vantage API for real financial news');
      } else if (hasAlphaVantage) {
        console.log('\n✅ Good setup! Alpha Vantage provides excellent financial news');
      }
      
    } catch (error) {
      console.log('❌ .env file not found');
      console.log('💡 Run this again after creating your .env file');
    }
  }

  showTestingCommands() {
    console.log('\n🧪 Testing Commands:');
    console.log('   Test all APIs: node test-news-apis-comprehensive.js');
    console.log('   Test Alpha Vantage: node test-alpha-vantage-news.js');
    console.log('   Test backend: curl http://localhost:3002/market-news/public');
    console.log('   Check status: curl http://localhost:3002/market-news/public?limit=1');
  }

  generatePriorityRecommendations() {
    console.log('\n🎯 Setup Priority Recommendations:\n');
    
    console.log('PHASE 1 - Essential (5 minutes):');
    console.log('1. Get Alpha Vantage API key (free, 500 calls/day)');
    console.log('2. Add to .env file');
    console.log('3. Restart backend server');
    console.log('4. Test with: node test-news-apis-comprehensive.js\n');
    
    console.log('PHASE 2 - Enhanced (10 minutes):');
    console.log('1. Get Marketaux API token (free, 100 calls/month)');
    console.log('2. Add to .env file');
    console.log('3. Test real-time global financial coverage\n');
    
    console.log('PHASE 3 - Complete (15 minutes):');
    console.log('1. Get NewsAPI.org key (free, 1000 calls/month)');
    console.log('2. Full three-tier news coverage');
    console.log('3. Maximum reliability and coverage\n');
    
    console.log('💡 Even with ZERO APIs, your system works with enhanced fallback!');
    console.log('🚀 With just Alpha Vantage, you get excellent financial news coverage!');
  }

  run() {
    console.log('='.repeat(60));
    console.log('🗞️  IVREX NEWS API SETUP HELPER');
    console.log('='.repeat(60));
    
    this.displaySetupGuide();
    this.checkCurrentSetup();
    this.generatePriorityRecommendations();
    this.showTestingCommands();
    
    console.log('\n' + '='.repeat(60));
    console.log('✨ Your news system is ready to work even without API keys!');
    console.log('🎯 Add Alpha Vantage for the best experience!');
    console.log('='.repeat(60));
  }
}

// Run the setup helper
const setup = new NewsAPISetup();
setup.run();