// Test farm operations endpoints with authentication
const http = require('http');

// First login to get token
const loginData = JSON.stringify({
  email: 'admin@farm.com',
  password: 'admin123'
});

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

const loginReq = http.request(loginOptions, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    const loginResponse = JSON.parse(body);
    if (res.statusCode === 200 && loginResponse.token) {
      console.log('✅ Login successful!');
      console.log('Token:', loginResponse.token.substring(0, 50) + '...');
      
      // Test farm operations endpoints
      const endpoints = [
        '/api/farm/pest-control',
        '/api/farm/equipment-status',
        '/api/farm/field-activity',
        '/api/farm/crops',
        '/api/farm/soil-metrics',
        '/api/farm/weather-data',
        '/api/farm/irrigation-status'
      ];

      endpoints.forEach((endpoint, index) => {
        setTimeout(() => {
          console.log(`\n🧪 Testing ${endpoint}...`);
          
          const options = {
            hostname: 'localhost',
            port: 3001,
            path: endpoint,
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${loginResponse.token}`,
              'Content-Type': 'application/json'
            }
          };

          const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => {
              console.log(`Status: ${res.statusCode}`);
              if (res.statusCode === 200) {
                const response = JSON.parse(responseBody);
                console.log(`✅ ${endpoint} - Success`);
                console.log('Data preview:', JSON.stringify(response).substring(0, 200) + '...');
              } else {
                console.log(`❌ ${endpoint} - Failed`);
                console.log('Error:', responseBody);
              }
            });
          });

          req.on('error', (error) => {
            console.log(`❌ ${endpoint} - Request Error:`, error.message);
          });

          req.end();
        }, index * 1000); // Test each endpoint with 1 second delay
      });

    } else {
      console.log('❌ Login failed:', body);
    }
  });
});

loginReq.on('error', (error) => {
  console.error('Login request error:', error.message);
});

loginReq.write(loginData);
loginReq.end();
