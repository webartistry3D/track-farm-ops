const https = require('https');

const testData = {
  email: 'new@owner.com',
  password: 'test123'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'track-farm-ops-backend.onrender.com',
  port: 443,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log('🔍 Status:', res.statusCode);
  console.log('📋 Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📝 Response Body:', data);
    try {
      const parsed = JSON.parse(data);
      if (res.statusCode === 200) {
        console.log('✅ Login successful!');
      } else {
        console.log('❌ Login failed:', parsed);
      }
    } catch (e) {
      console.log('❌ Parse error:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.log('❌ Request error:', e.message);
});

req.write(postData);
req.end();
