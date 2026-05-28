// Simple test to verify farm operations API works
const http = require('http');

// Test login
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

const req = http.request(loginOptions, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Login Response:', res.statusCode);
    console.log('Response Body:', body.substring(0, 200));
  });
});

req.on('error', (error) => {
  console.error('Login Error:', error.message);
});

req.write(loginData);
req.end();
