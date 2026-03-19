const axios = require('axios');

async function testOwnerSignup() {
  try {
    console.log('🧪 Testing owner signup with organization auto-creation');
    
    const signupData = {
      name: 'Test Owner',
      email: 'testowner@trackfarmops.com',
      password: 'Password1706',
      farmName: 'Test Farm'
    };
    
    console.log('📋 Sending signup data:', signupData);
    
    const response = await axios.post('http://localhost:3001/api/auth/signup', signupData);
    
    console.log('✅ Signup successful!');
    console.log('📋 Response:', {
      status: response.status,
      message: response.data.message,
      userEmail: response.data.user?.email,
      userRole: response.data.user?.role,
      hasOrganization: !!response.data.user?.organizationId
    });
    
    // Test login with the new account
    console.log('\n🔍 Testing login with new account...');
    
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: signupData.email,
      password: signupData.password
    });
    
    console.log('✅ Login successful!');
    console.log('📋 Login response:', {
      status: loginResponse.status,
      userEmail: loginResponse.data.user?.email,
      userRole: loginResponse.data.user?.role,
      organizationId: loginResponse.data.user?.organizationId,
      tokenLength: loginResponse.data.token?.length
    });
    
    // Test profile access
    console.log('\n🔍 Testing profile access...');
    
    const profileResponse = await axios.get('http://localhost:3001/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('✅ Profile access successful!');
    console.log('📋 Profile data:', profileResponse.data);
    
  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.response?.data?.error || error.message,
      status: error.response?.status
    });
  }
}

testOwnerSignup();
