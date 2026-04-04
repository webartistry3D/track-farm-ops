#!/usr/bin/env node

const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

async function smartStart() {
  try {
    console.log('🔧 Smart start: checking for compiled JavaScript...');
    
    const distIndexPath = path.join(__dirname, '..', 'dist', 'index.js');
    const compiledExists = fs.existsSync(distIndexPath);
    
    if (compiledExists) {
      console.log('✅ Compiled JavaScript found, using node dist/index.js');
      const serverProcess = spawn('node', ['dist/index.js'], {
        stdio: 'inherit',
        env: process.env
      });
      
      serverProcess.on('error', (error) => {
        console.error('❌ Failed to start compiled server:', error);
        process.exit(1);
      });
      
      serverProcess.on('exit', (code) => {
        console.log(`🔍 Compiled server exited with code ${code}`);
        process.exit(code);
      });
      
    } else {
      console.log('⚠️ No compiled JavaScript found, using ts-node src/index.ts');
      const serverProcess = spawn('npx', ['ts-node', 'src/index.ts'], {
        stdio: 'inherit',
        env: process.env,
        shell: true
      });
      
      serverProcess.on('error', (error) => {
        console.error('❌ Failed to start ts-node server:', error);
        process.exit(1);
      });
      
      serverProcess.on('exit', (code) => {
        console.log(`🔍 ts-node server exited with code ${code}`);
        process.exit(code);
      });
    }
    
  } catch (error) {
    console.error('❌ Smart start failed:', error);
    process.exit(1);
  }
}

smartStart();
