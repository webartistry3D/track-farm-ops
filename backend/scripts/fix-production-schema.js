const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixSchema() {
  console.log('🔧 Fixing production database schema...');
  
  try {
    // Add missing password tracking columns to users table
    console.log('📊 Adding password tracking columns to users table...');
    
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ Added last_password_change column');
    } catch (e) {
      console.log('⚠️ last_password_change column might already exist');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS password_changed_by INTEGER REFERENCES users(id)
      `);
      console.log('✅ Added password_changed_by column');
    } catch (e) {
      console.log('⚠️ password_changed_by column might already exist');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS password_change_count INTEGER DEFAULT 0
      `);
      console.log('✅ Added password_change_count column');
    } catch (e) {
      console.log('⚠️ password_change_count column might already exist');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT FALSE
      `);
      console.log('✅ Added requires_password_change column');
    } catch (e) {
      console.log('⚠️ requires_password_change column might already exist');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS address VARCHAR(255)
      `);
      console.log('✅ Added address column');
    } catch (e) {
      console.log('⚠️ address column might already exist');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS phone VARCHAR(255)
      `);
      console.log('✅ Added phone column');
    } catch (e) {
      console.log('⚠️ phone column might already exist');
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(255)
      `);
      console.log('✅ Added profile_image_url column');
    } catch (e) {
      console.log('⚠️ profile_image_url column might already exist');
    }

    // Create password_history table if it doesn't exist
    console.log('📚 Creating password_history table...');
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS password_history (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_by INTEGER REFERENCES users(id),
          ip_address INET,
          user_agent TEXT
        )
      `);
      console.log('✅ password_history table created');
    } catch (e) {
      console.log('⚠️ password_history table might already exist');
    }

    // Create audit_logs table if it doesn't exist
    console.log('📋 Creating audit_logs table...');
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id SERIAL PRIMARY KEY,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          level VARCHAR(20) NOT NULL CHECK (level IN ('INFO', 'WARNING', 'ERROR', 'SECURITY')),
          action VARCHAR(50) NOT NULL,
          resource VARCHAR(100) NOT NULL,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
          user_role VARCHAR(50),
          organization_name VARCHAR(255),
          ip_address INET,
          user_agent TEXT,
          resource_id TEXT,
          details JSONB,
          success BOOLEAN NOT NULL DEFAULT true,
          error_message TEXT
        )
      `);
      console.log('✅ audit_logs table created');
    } catch (e) {
      console.log('⚠️ audit_logs table might already exist');
    }

    // Create field_activities table if it doesn't exist
    console.log('🌾 Creating field_activities table...');
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS field_activities (
          id SERIAL PRIMARY KEY,
          worker_name VARCHAR(255) NOT NULL,
          task VARCHAR(255) NOT NULL,
          start_time TIMESTAMP NOT NULL,
          end_time TIMESTAMP,
          duration FLOAT,
          progress FLOAT DEFAULT 0,
          priority VARCHAR(50) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
          status VARCHAR(50) DEFAULT 'IN_PROGRESS' CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'CANCELLED')),
          zone VARCHAR(255),
          field VARCHAR(255),
          notes TEXT,
          organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ field_activities table created');
    } catch (e) {
      console.log('⚠️ field_activities table might already exist');
    }

    // Create soil_analyses table if it doesn't exist
    console.log('🌱 Creating soil_analyses table...');
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS soil_analyses (
          id SERIAL PRIMARY KEY,
          zone VARCHAR(255) NOT NULL,
          field VARCHAR(255),
          sample_date TIMESTAMP NOT NULL,
          moisture_level FLOAT NOT NULL,
          ph_level FLOAT NOT NULL,
          nitrogen_level FLOAT NOT NULL,
          phosphorus_level FLOAT NOT NULL,
          potassium_level FLOAT NOT NULL,
          organic_matter FLOAT NOT NULL,
          texture VARCHAR(255),
          recommendation TEXT,
          treatment_type VARCHAR(255),
          treatment_date TIMESTAMP,
          organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ soil_analyses table created');
    } catch (e) {
      console.log('⚠️ soil_analyses table might already exist');
    }

    // Create irrigation_schedules table if it doesn't exist
    console.log('💧 Creating irrigation_schedules table...');
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS irrigation_schedules (
          id SERIAL PRIMARY KEY,
          zone VARCHAR(255) NOT NULL,
          field VARCHAR(255),
          start_time TIMESTAMP NOT NULL,
          end_time TIMESTAMP NOT NULL,
          duration FLOAT NOT NULL,
          water_amount FLOAT NOT NULL,
          frequency VARCHAR(255) NOT NULL,
          last_run TIMESTAMP,
          next_run TIMESTAMP,
          status VARCHAR(50) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
          pump_status VARCHAR(255),
          flow_rate FLOAT,
          organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ irrigation_schedules table created');
    } catch (e) {
      console.log('⚠️ irrigation_schedules table might already exist');
    }

    // Create pest_control table if it doesn't exist
    console.log('🐛 Creating pest_control table...');
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS pest_control (
          id SERIAL PRIMARY KEY,
          pest_type VARCHAR(255) NOT NULL,
          severity VARCHAR(255) NOT NULL,
          affected_area VARCHAR(255),
          treatment_method VARCHAR(255) NOT NULL,
          application_date TIMESTAMP NOT NULL,
          follow_up_date TIMESTAMP,
          threat_level VARCHAR(255) DEFAULT 'LOW',
          treatment_efficacy FLOAT DEFAULT 0,
          next_spray TIMESTAMP,
          last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          chemicals_used JSONB,
          cost FLOAT,
          notes TEXT,
          organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ pest_control table created');
    } catch (e) {
      console.log('⚠️ pest_control table might already exist');
    }

    // Create indexes
    console.log('🔍 Creating indexes...');
    try {
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_password_history_user_id_created_at ON password_history(user_id, created_at DESC)`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC)`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id)`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource)`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_audit_logs_level ON audit_logs(level)`);
      console.log('✅ Indexes created');
    } catch (e) {
      console.log('⚠️ Some indexes might already exist');
    }

    console.log('🎉 Schema fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Schema fix failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixSchema()
  .then(() => {
    console.log('✅ Schema fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Schema fix failed:', error);
    process.exit(1);
  });
