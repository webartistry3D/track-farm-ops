const axios = require('axios');

async function debugProfile() {
  try {
    console.log('🧪 Testing login and profile for kelechi@owner.com');
    
    // Step 1: Login
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'kelechi@owner.com',
      password: 'Password1706'
    });
    
    console.log('✅ Login successful!');
    console.log('📋 Login response:', {
      status: loginResponse.status,
      userEmail: loginResponse.data.user?.email,
      userRole: loginResponse.data.user?.role,
      organizationId: loginResponse.data.user?.organizationId,
      tokenLength: loginResponse.data.token?.length
    });
    
    const token = loginResponse.data.token;
    
    // Step 2: Test profile with detailed debugging
    console.log('\n🔍 Testing profile endpoint...');
    
    try {
      const profileResponse = await axios.get('http://localhost:3001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Profile endpoint successful!');
      console.log('📋 Profile response:', profileResponse.data);
      
    } catch (profileError) {
      console.error('❌ Profile endpoint failed:', {
        message: profileError.response?.data?.error || profileError.message,
        status: profileError.response?.status,
        code: profileError.response?.data?.code
      });
    }
    
  } catch (error) {
    console.error('❌ Login failed:', {
      message: error.response?.data?.error || error.message,
      status: error.response?.status
    });
  }
}

debugProfile();
