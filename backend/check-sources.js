import axios from 'axios';

async function checkSources() {
  try {
    console.log('🔍 Checking economic event sources...\n');
    
    const response = await axios.get('http://localhost:3002/economic-events/today');
    
    if (response.data && response.data.data) {
      const events = response.data.data;
      console.log(`📊 Found ${events.length} events for today\n`);
      
      // Group events by source
      const sourceGroups = {};
      events.forEach(event => {
        const source = event.source || 'UNKNOWN';
        if (!sourceGroups[source]) {
          sourceGroups[source] = [];
        }
        sourceGroups[source].push(event);
      });
      
      // Display source summary
      console.log('📋 Sources found:');
      Object.keys(sourceGroups).forEach(source => {
        console.log(`   ✅ ${source}: ${sourceGroups[source].length} events`);
      });
      
      console.log('\n📅 Sample events:');
      events.slice(0, 3).forEach(event => {
        console.log(`   • ${event.eventName}`);
        console.log(`     Source: ${event.source}`);
        console.log(`     Country: ${event.country}`);
        console.log(`     Time: ${event.releaseTime}`);
        console.log(`     Importance: ${event.importance}\n`);
      });
      
      // Check if FMP_FALLBACK still exists
      const hasFMPFallback = events.some(event => event.source === 'FMP_FALLBACK');
      if (hasFMPFallback) {
        console.log('❌ Found FMP_FALLBACK sources - cleanup incomplete');
      } else {
        console.log('✅ No FMP_FALLBACK sources found - cleanup successful!');
      }
      
    } else {
      console.log('❌ No events found or unexpected response format');
    }
  } catch (error) {
    console.log('❌ Error checking sources:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure backend is running on port 3002');
    }
  }
}

checkSources(); 