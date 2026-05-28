// Simple test script to verify farm operations endpoints
const http = require('http');

// Test data for login
const loginData = JSON.stringify({
  email: 'admin@farm.com',
  password: 'admin123'
});

// Function to make HTTP request
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
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

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function testFarmOperations() {
  console.log('Testing Farm Operations API...\n');

  try {
    // Step 1: Login to get token
    console.log('1. Testing login...');
    const loginOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    const loginResult = await makeRequest(loginOptions, loginData);
    console.log(`Login Status: ${loginResult.statusCode}`);
    
    if (loginResult.statusCode === 200 && loginResult.body.token) {
      const token = loginResult.body.token;
      console.log('Login successful! Token received.\n');

      // Step 2: Test farm operations endpoints
      const endpoints = [
        '/api/farm/pest-control',
        '/api/farm/equipment-status', 
        '/api/farm/field-activity',
        '/api/farm/crops',
        '/api/farm/soil-metrics',
        '/api/farm/weather-data',
        '/api/farm/irrigation-status'
      ];

      for (const endpoint of endpoints) {
        console.log(`2. Testing ${endpoint}...`);
        
        const options = {
          hostname: 'localhost',
          port: 3001,
          path: endpoint,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        const result = await makeRequest(options);
        console.log(`${endpoint} Status: ${result.statusCode}`);
        
        if (result.statusCode === 200) {
          console.log(`Response: ${JSON.stringify(result.body, null, 2).substring(0, 200)}...`);
        } else {
          console.log(`Error: ${result.body}`);
        }
        console.log('---');
      }

    } else {
      console.log('Login failed:', loginResult.body);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testFarmOperations();
