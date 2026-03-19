const axios = require('axios');

async function testSubscriptionEndpoint() {
  try {
    console.log('🔍 Testing /subscription/current endpoint...\n');

    // You'll need to get a valid token from the browser
    // For now, let's test with a mock token to see the endpoint structure
    const response = await axios.get('http://localhost:3001/api/subscription/current', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });

    console.log('✅ Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log(`❌ Error ${error.response.status}:`, error.response.data);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

// Test without auth first to see if endpoint exists
testSubscriptionEndpoint();
