const axios = require('axios');

async function testKelechiLogin() {
  try {
    console.log('🧪 Testing login for kelechi@owner.com with password: Password1706');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'kelechi@owner.com',
      password: 'Password1706'
    });
    
    console.log('✅ Login successful!');
    console.log('📋 Response:', {
      status: response.status,
      hasToken: !!response.data.token,
      hasUser: !!response.data.user,
      userEmail: response.data.user?.email,
      userRole: response.data.user?.role,
      tokenLength: response.data.token?.length,
      userName: response.data.user?.name
    });
    
    // Test if token works by making a protected request
    const testResponse = await axios.get('http://localhost:3001/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${response.data.token}`
      }
    });
    
    console.log('✅ Token validation successful!');
    console.log('📋 Profile data:', {
      email: testResponse.data.user?.email,
      name: testResponse.data.user?.name,
      role: testResponse.data.user?.role
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
