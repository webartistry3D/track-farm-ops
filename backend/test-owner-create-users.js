const axios = require('axios');

async function testOwnerCreateUsers() {
  try {
    console.log('🧪 Testing owner ability to create manager/worker users...');
    
    // Step 1: Login as owner to get token
    console.log('🔐 Logging in as owner...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'testowner2@trackfarmops.com',
      password: 'Password1706'
    });
    
    const ownerToken = loginResponse.data.token;
    console.log('✅ Owner login successful');
    
    // Step 2: Create a Manager user
    console.log('\n👨‍💼 Creating Manager user...');
    const managerData = {
      name: 'Test Manager',
      email: 'testmanager@trackfarmops.com',
      password: 'Password1706',
      role: 'MANAGER'
    };
    
    try {
      const managerResponse = await axios.post('http://localhost:3001/api/auth/users', managerData, {
        headers: {
          'Authorization': `Bearer ${ownerToken}`
        }
      });
      
      console.log('✅ Manager created successfully!');
      console.log('📋 Manager response:', {
        status: managerResponse.status,
        message: managerResponse.data.message,
        userName: managerResponse.data.user?.name,
        userRole: managerResponse.data.user?.role,
        organizationId: managerResponse.data.user?.organizationId
      });
    } catch (managerError) {
      console.error('❌ Manager creation failed:', {
        message: managerError.response?.data?.error || managerError.message,
        status: managerError.response?.status,
        code: managerError.response?.data?.code
      });
    }
    
    // Step 3: Create a Worker user
    console.log('\n👷 Creating Worker user...');
    const workerData = {
      name: 'Test Worker',
      email: 'testworker@trackfarmops.com',
      password: 'Password1706',
      role: 'WORKER'
    };
    
    try {
      const workerResponse = await axios.post('http://localhost:3001/api/auth/users', workerData, {
        headers: {
          'Authorization': `Bearer ${ownerToken}`
        }
      });
      
      console.log('✅ Worker created successfully!');
      console.log('📋 Worker response:', {
        status: workerResponse.status,
        message: workerResponse.data.message,
        userName: workerResponse.data.user?.name,
        userRole: workerResponse.data.user?.role,
        organizationId: workerResponse.data.user?.organizationId
      });
    } catch (workerError) {
      console.error('❌ Worker creation failed:', {
        message: workerError.response?.data?.error || workerError.message,
        status: workerError.response?.status,
        code: workerError.response?.data?.code
      });
    }
    
    // Step 4: Test login for created users to verify JWT tokens
    console.log('\n🔍 Testing login for created users...');
    
    try {
      const managerLogin = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'testmanager@trackfarmops.com',
        password: 'Password1706'
      });
      
      console.log('✅ Manager login successful!');
      console.log('📋 Manager login:', {
        tokenLength: managerLogin.data.token?.length,
        organizationId: managerLogin.data.user?.organizationId
      });
    } catch (managerLoginError) {
      console.error('❌ Manager login failed:', managerLoginError.response?.data?.error);
    }
    
    try {
      const workerLogin = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'testworker@trackfarmops.com',
        password: 'Password1706'
      });
      
      console.log('✅ Worker login successful!');
      console.log('📋 Worker login:', {
        tokenLength: workerLogin.data.token?.length,
        organizationId: workerLogin.data.user?.organizationId
      });
    } catch (workerLoginError) {
      console.error('❌ Worker login failed:', workerLoginError.response?.data?.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.response?.data?.error || error.message,
      status: error.response?.status
    });
  }
}

testOwnerCreateUsers();
