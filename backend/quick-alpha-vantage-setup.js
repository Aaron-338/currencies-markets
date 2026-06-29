#!/usr/bin/env node

/**
 * Quick Alpha Vantage API Setup Helper
 * The fastest way to get real financial news in your IVREX system
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

class AlphaVantageSetup {
  constructor() {
    this.envPath = path.join(process.cwd(), '.env');
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async run() {
    console.log('⚡ Quick Alpha Vantage API Setup for IVREX');
    console.log('   Get real financial news in 3 minutes!\n');
    
    console.log('📋 What you need:');
    console.log('   1. Alpha Vantage API key (free, 500 calls/day)');
    console.log('   2. 2 minutes of your time\n');
    
    console.log('🚀 Let\'s get started!\n');
    
    this.showSignupInstructions();
    await this.waitForApiKey();
    this.rl.close();
  }

  showSignupInstructions() {
    console.log('Step 1: Get Your Free API Key');
    console.log('   🌐 Open: https://www.alphavantage.co/support/#api-key');
    console.log('   📝 Fill out the simple form (no credit card needed)');
    console.log('   📧 Check your email for the API key');
    console.log('   ⏱️ Takes 30 seconds\n');
    
    console.log('💡 Why Alpha Vantage?');
    console.log('   ✅ Best free financial news API');
    console.log('   ✅ Real-time news with sentiment analysis');
    console.log('   ✅ 500 calls/day (perfect for development)');
    console.log('   ✅ No credit card required');
    console.log('   ✅ Works immediately\n');
  }

  async waitForApiKey() {
    return new Promise((resolve) => {
      this.rl.question('Step 2: Paste your Alpha Vantage API key here (or press Enter to skip): ', (apiKey) => {
        if (!apiKey.trim()) {
          console.log('\n⏭️ Skipped - you can add it later to .env file');
          console.log('   📁 File location: ' + this.envPath);
          console.log('   📝 Add: ALPHAVANTAGE_API_KEY=your_key_here');
          resolve();
          return;
        }

        this.addApiKeyToEnv(apiKey.trim());
        resolve();
      });
    });
  }

  addApiKeyToEnv(apiKey) {
    try {
      let envContent = fs.readFileSync(this.envPath, 'utf8');
      
      if (envContent.includes('ALPHAVANTAGE_API_KEY=')) {
        // Replace existing empty key
        envContent = envContent.replace(/ALPHAVANTAGE_API_KEY=.*/, `ALPHAVANTAGE_API_KEY=${apiKey}`);
      } else {
        // Add new key
        envContent += `\nALPHAVANTAGE_API_KEY=${apiKey}\n`;
      }

      fs.writeFileSync(this.envPath, envContent);
      
      console.log('\n✅ Success! API key added to .env file');
      console.log('📁 Location: ' + this.envPath);
      
      this.showNextSteps(apiKey);
      
    } catch (error) {
      console.log('\n❌ Error adding API key:', error.message);
      console.log('💡 Manually add this to your .env file:');
      console.log(`   ALPHAVANTAGE_API_KEY=${apiKey}`);
    }
  }

  showNextSteps(apiKey) {
    console.log('\n🎉 Alpha Vantage Setup Complete!\n');
    
    console.log('🔄 Step 3: Restart Your Backend');
    console.log('   npm run start:dev\n');
    
    console.log('🧪 Step 4: Test Real News');
    console.log('   node test-news-apis-comprehensive.js\n');
    
    console.log('📊 What You\'ll Get:');
    console.log('   ✅ Real-time financial news');
    console.log('   ✅ Sentiment analysis (bullish/bearish/neutral)');
    console.log('   ✅ Professional news sources');
    console.log('   ✅ Up to 500 articles/day');
    console.log('   ✅ Automatic fallback if limits reached\n');
    
    console.log('🔗 Quick Test:');
    console.log('   Backend: curl http://localhost:3002/market-news/public');
    console.log('   Frontend: http://localhost:3000\n');
    
    console.log('🎯 Your IVREX news system now has REAL financial data!');
    console.log('✨ Still works perfectly even if API is down (enhanced fallback)');
  }
}

// Run the setup
const setup = new AlphaVantageSetup();
setup.run().catch(console.error);