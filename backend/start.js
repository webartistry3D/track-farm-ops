// Simple JavaScript server startup to bypass TypeScript issues
const { exec } = require('child_process');
const path = require('path');

console.log('Starting server with JavaScript compilation bypass...');

// Start the server with ts-node transpile-only mode
const server = exec('npx ts-node --transpile-only src/index.ts', {
  cwd: __dirname,
  env: { ...process.env, NODE_ENV: 'development' }
});

server.stdout.on('data', (data) => {
  console.log(data.toString());
});

server.stderr.on('data', (data) => {
  console.error(data.toString());
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping server...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Stopping server...');
  server.kill('SIGTERM');
  process.exit(0);
});
