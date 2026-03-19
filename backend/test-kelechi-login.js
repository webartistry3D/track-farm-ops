const axios = require('axios');

async function testKelechiLogin() {
  try {
    console.log('🧪 Testing login for kelechi@owner.com');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'kelechi@owner.com',
      password: 'password123' // Assuming default password
    });
    
    console.log('✅ Login successful!');
    console.log('📋 Response:', {
      status: response.status,
      hasToken: !!response.data.token,
      hasUser: !!response.data.user,
      userEmail: response.data.user?.email,
      userRole: response.data.user?.role,
      tokenLength: response.data.token?.length
    });
    
  } catch (error) {
    console.error('❌ Login failed:', {
      message: error.response?.data?.error || error.message,
      status: error.response?.status,
      isNetworkError: !error.response
    });
  }
}

testKelechiLogin();
