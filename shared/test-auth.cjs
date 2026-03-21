const http = require('http');

// Test data
const testUser = {
  name: 'Farmer One',
  email: 'farmer@one.com',
  password: 'Password1706'
};

// Function to make HTTP requests
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(result);
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test authentication flow
async function testAuth() {
  console.log('🧪 Testing Authentication Flow...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/health',
      method: 'GET'
    };
    
    const health = await makeRequest(healthOptions);
    console.log('Health status:', health.statusCode, health.body);
    console.log('');

    // Test 2: Login attempt
    console.log('2. Testing login with farmer@one.com...');
    const loginOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const loginResponse = await makeRequest(loginOptions, {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('Login status:', loginResponse.statusCode);
    console.log('Login response:', JSON.stringify(loginResponse.body, null, 2));
    console.log('');

    // Test 3: If login failed, try signup
    if (loginResponse.statusCode !== 200) {
      console.log('3. Login failed, trying signup...');
      const signupOptions = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/auth/signup',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const signupResponse = await makeRequest(signupOptions, testUser);
      console.log('Signup status:', signupResponse.statusCode);
      console.log('Signup response:', JSON.stringify(signupResponse.body, null, 2));
      console.log('');

      // Test 4: Try login again after signup
      console.log('4. Testing login after signup...');
      const loginResponse2 = await makeRequest(loginOptions, {
        email: testUser.email,
        password: testUser.password
      });
      
      console.log('Second login status:', loginResponse2.statusCode);
      console.log('Second login response:', JSON.stringify(loginResponse2.body, null, 2));
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testAuth();
