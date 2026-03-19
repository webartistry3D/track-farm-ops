const axios = require('axios');

async function testSubscriptionAPI() {
  try {
    console.log('🔍 Testing subscription API endpoint...\n');

    // We need to get a valid token. Let's try to login first
    console.log('🔑 Attempting to login to get token...');
    
    try {
      const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'keechi@owner.com',
        password: 'Password1706#'
      });

      const token = loginResponse.data.token;
      console.log('✅ Login successful, got token');

      // Now test the subscription endpoint
      console.log('\n📋 Testing /subscription/current endpoint...');
      
      const subscriptionResponse = await axios.get('http://localhost:3001/api/subscription/current', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Subscription API Response:');
      console.log(JSON.stringify(subscriptionResponse.data, null, 2));

      // Check if the response matches what we expect
      const subscription = subscriptionResponse.data;
      
      if (subscription.plan === 'growth' && subscription.status === 'active') {
        console.log('\n🎉 SUCCESS: API returns correct active subscription!');
        console.log('   The issue is likely in the frontend UI update logic');
      } else {
        console.log('\n⚠️  ISSUE: API is not returning expected data');
        console.log(`   Expected: plan=growth, status=active`);
        console.log(`   Received: plan=${subscription.plan}, status=${subscription.status}`);
      }

    } catch (loginError) {
      console.log('❌ Login failed:', loginError.response?.data || loginError.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSubscriptionAPI();
