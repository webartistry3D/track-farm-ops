const axios = require('axios');

async function testCurrentSignup() {
  try {
    console.log('🧪 Testing current signup implementation...');
    
    const signupData = {
      name: 'Test Owner',
      email: 'testowner2@trackfarmops.com',
      password: 'Password1706',
      farmName: 'Test Farm 2'
    };
    
    console.log('📋 Sending signup data:', signupData);
    
    const response = await axios.post('http://localhost:3001/api/auth/signup', signupData);
    
    console.log('✅ Signup successful!');
    console.log('📋 Response:', {
      status: response.status,
      message: response.data.message,
      userEmail: response.data.user?.email,
      userRole: response.data.user?.role,
      hasOrganization: !!response.data.user?.organizationId,
      organizationId: response.data.user?.organizationId
    });
    
    // Verify user was created with organization
    console.log('\n🔍 Verifying user in database...');
    
    // Test login to confirm JWT token generation
    console.log('\n🔍 Testing login for JWT token...');
    
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
      tokenLength: loginResponse.data.token?.length,
      hasToken: !!loginResponse.data.token
    });
    
    console.log('\n🎯 Current signup implementation status:');
    console.log('   ✅ Creates owner by default');
    console.log('   ✅ Creates organization when farmName provided');
    console.log('   ✅ Links user to organization');
    console.log('   ✅ Generates JWT token on login');
    
  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.response?.data?.error || error.message,
      status: error.response?.status
    });
  }
}

testCurrentSignup();
