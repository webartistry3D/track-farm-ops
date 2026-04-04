#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function debugStart() {
  try {
    console.log('🔍 Debug: Starting application startup...');
    
    // Step 1: Run critical columns fix
    console.log('🔧 Debug: Running critical columns fix...');
    try {
      execSync('node fix-critical-columns.js', { 
        stdio: 'inherit',
        timeout: 30000
      });
      console.log('✅ Debug: Critical columns fix completed');
    } catch (columnsError) {
      console.error('❌ Debug: Critical columns fix failed:', columnsError.message);
      process.exit(1);
    }
    
    // Step 2: Test database connection
    console.log('🔍 Debug: Testing database connection...');
    try {
      await prisma.$connect();
      console.log('✅ Debug: Database connection successful');
      
      // Test a simple query
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Debug: Database query successful:', result);
      
    } catch (dbError) {
      console.error('❌ Debug: Database connection failed:', dbError.message);
      console.error('❌ Debug: Database error details:', {
        code: dbError.code,
        meta: dbError.meta,
        stack: dbError.stack
      });
      process.exit(1);
    }
    
    // Step 3: Check environment variables
    console.log('🔍 Debug: Environment variables:');
    console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`- PORT: ${process.env.PORT}`);
    console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);
    
    // Step 4: Start the actual server
    console.log('🚀 Debug: Starting TypeScript server...');
    try {
      const { spawn } = require('child_process');
      
      const serverProcess = spawn('npx', ['ts-node', 'src/index.ts'], {
        stdio: 'inherit',
        env: process.env,
        shell: true
      });
      
      serverProcess.on('error', (error) => {
        console.error('❌ Debug: Failed to start server process:', error);
        process.exit(1);
      });
      
      serverProcess.on('exit', (code, signal) => {
        console.log(`🔍 Debug: Server process exited with code ${code}, signal ${signal}`);
        if (code !== 0) {
          process.exit(code);
        }
      });
      
      // Keep the process alive
      serverProcess.on('close', (code) => {
        console.log(`🔍 Debug: Server process closed with code ${code}`);
      });
      
    } catch (spawnError) {
      console.error('❌ Debug: Failed to spawn server:', spawnError.message);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Debug: Startup failed:', error);
    process.exit(1);
  } finally {
    // Don't disconnect here - let the server process handle it
  }
}

debugStart();
