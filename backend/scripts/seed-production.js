const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

// 🚫 USER CREATION DISABLED - This script can no longer create users
// ONE-TIME SETUP COMPLETED - User creation disabled again
console.log('❌ USER CREATION DISABLED - One-time setup completed');
console.log('🔒 User seeding has been permanently disabled for security reasons');
process.exit(1);

async function seedProduction() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🌱 Starting production database seeding...');
    
    // Step 1: Check if admin user already exists
    console.log('👤 Checking for existing admin user...');
    const existingUser = await prisma.user.findUnique({
      where: { email: 'kelechi@owner.com' }
    });
    
    if (existingUser) {
      console.log('✅ Admin user already exists, skipping seeding');
      return;
    }
    
    // Step 2: Get or create default organization
    console.log('🏢 Setting up default organization...');
    let organization;
    
    try {
      // Try to find an existing organization first
      const existingOrg = await prisma.organization.findFirst();
      if (existingOrg) {
        organization = existingOrg;
        console.log(`✅ Using existing organization: ${organization.name} (ID: ${organization.id})`);
      } else {
        // Create new organization
        organization = await prisma.organization.create({
          data: {
            name: 'default',
            description: 'Default organization for TrackFarmOps'
          }
        });
        console.log(`✅ Created new organization: ${organization.name} (ID: ${organization.id})`);
      }
    } catch (orgError) {
      console.error('❌ Organization setup failed:', orgError);
      throw new Error(`Failed to setup organization: ${orgError.message}`);
    }
    
    // Step 3: Create admin user
    console.log('👑 Creating admin user...');
    try {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = await prisma.user.create({
        data: {
          name: 'Kelechi Owner',
          email: 'kelechi@owner.com',
          password: hashedPassword,
          role: 'OWNER',
          organizationId: organization.id
        }
      });
      
      console.log('✅ Admin user created successfully!');
      console.log(`📧 Email: ${adminUser.email}`);
      console.log(`🔑 Password: admin123`);
      console.log(`🏢 Organization: ${organization.name} (ID: ${organization.id})`);
      console.log(`👤 User ID: ${adminUser.id}`);
      
    } catch (userError) {
      console.error('❌ Admin user creation failed:', userError);
      throw new Error(`Failed to create admin user: ${userError.message}`);
    }
    
    // Step 4: Verify setup
    console.log('🔍 Verifying setup...');
    const verification = await prisma.user.findUnique({
      where: { email: 'kelechi@owner.com' },
      include: { organization: true }
    });
    
    if (verification) {
      console.log('✅ Setup verification successful!');
      console.log(`📊 Total users in database: ${await prisma.user.count()}`);
      console.log(`📊 Total organizations: ${await prisma.organization.count()}`);
    } else {
      throw new Error('Verification failed - admin user not found after creation');
    }
    
    console.log('🎉 Production database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedProduction()
    .then(() => {
      console.log('✅ Seeding script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding script failed:', error);
      process.exit(1);
    });
}

module.exports = { seedProduction };
