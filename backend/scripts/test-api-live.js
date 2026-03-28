const axios = require('axios');

async function testAPILive() {
  try {
    console.log('🔍 Testing LIVE API endpoint with authentication');
    
    // Test the exact API call the frontend makes
    const response = await axios.get('http://localhost:3001/api/finance/summary', {
      params: {
        startDate: '2026-03-28',
        endDate: '2026-03-28'
      },
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJPV05FUiIsIm9yZ2FuaXphdGlvbklkIjoxLCJpYXQiOjE3MjIyMjA0MDAsImV4cCI6MTcyMjMwNjgwMH0.example-token'
      }
    });
    
    console.log('✅ API Response:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API Error Response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.log('❌ No response from server:', error.message);
    } else {
      console.log('❌ Request error:', error.message);
    }
  }
}

testAPILive();
