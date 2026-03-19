const axios = require('axios');

async function testLogin() {
  console.log('🧪 Testing Login Endpoint...\n');
  
  const baseURL = 'http://localhost:3001/api';
  
  const testCredentials = [
    { email: 'owner@trackfarmops.com', password: 'password123', role: 'Owner' },
    { email: 'manager@trackfarmops.com', password: 'password123', role: 'Manager' },
    { email: 'worker@trackfarmops.com', password: 'password123', role: 'Worker' }
  ];
  
  for (const credentials of testCredentials) {
    try {
      console.log(`Testing ${credentials.role} login: ${credentials.email}`);
      
      const response = await axios.post(`${baseURL}/auth/login`, {
        email: credentials.email,
        password: credentials.password
      });
      
      console.log(`✅ ${credentials.role} login successful!`);
      console.log(`   User: ${response.data.user.name}`);
      console.log(`   Role: ${response.data.user.role}`);
      console.log(`   Organization: ${response.data.user.organizationName}`);
      console.log(`   Token: ${response.data.token.substring(0, 50)}...`);
      console.log('');
      
    } catch (error) {
      console.log(`❌ ${credentials.role} login failed:`);
      
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${error.response.data.error}`);
        if (error.response.data.debug) {
          console.log(`   Debug: ${error.response.data.debug}`);
        }
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`   Connection refused - backend server not running?`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
      console.log('');
    }
  }
  
  console.log('🎯 Login Test Complete!');
  console.log('\n📝 If all tests passed, you should be able to login with these credentials:');
  console.log('   Email: owner@trackfarmops.com');
  console.log('   Password: password123');
  console.log('\n🌐 Make sure your frontend is pointing to the correct API URL:');
  console.log('   Frontend should be running on http://localhost:5173');
  console.log('   Backend API should be accessible at http://localhost:3001/api');
}

testLogin().catch(console.error);
