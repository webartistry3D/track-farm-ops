const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('🔧 Creating test users for organization-wide access test...\n');

    // Get the owner's organization
    const owner = await prisma.user.findUnique({
      where: { email: 'keechi@owner.com' },
      select: { organizationId: true }
    });
    
    if (!owner) {
      console.log('❌ Owner not found');
      return;
    }
    
    console.log(`🏢 Creating users for Organization ID: ${owner.organizationId}\n`);

    // Create a test manager
    const managerPassword = await bcrypt.hash('Password1706#', 10);
    
    const existingManager = await prisma.user.findFirst({
      where: { email: 'manager@test.com' }
    });
    
    if (!existingManager) {
      const manager = await prisma.user.create({
        data: {
          name: 'Test Manager',
          email: 'manager@test.com',
          password: managerPassword,
          role: 'MANAGER',
          organizationId: owner.organizationId
        }
      });
      console.log('✅ Created test manager: manager@test.com (Password: Password1706#)');
    } else {
      console.log('ℹ️  Test manager already exists: manager@test.com');
    }

    // Create a test worker
    const workerPassword = await bcrypt.hash('Password1706#', 10);
    
    const existingWorker = await prisma.user.findFirst({
      where: { email: 'worker@test.com' }
    });
    
    if (!existingWorker) {
      const worker = await prisma.user.create({
        data: {
          name: 'Test Worker',
          email: 'worker@test.com',
          password: workerPassword,
          role: 'WORKER',
          organizationId: owner.organizationId
        }
      });
      console.log('✅ Created test worker: worker@test.com (Password: Password1706#)');
    } else {
      console.log('ℹ️  Test worker already exists: worker@test.com');
    }

    // Verify all users in organization
    console.log('\n👥 All users in organization:');
    const orgUsers = await prisma.user.findMany({
      where: { organizationId: owner.organizationId },
      select: {
        name: true,
        email: true,
        role: true
      },
      orderBy: { role: 'asc' }
    });
    
    orgUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\n🎯 Test Instructions:');
    console.log('1. Login as manager@test.com (Password: Password1706#)');
    console.log('2. Try accessing Inventory, Assets, and Analytics pages');
    console.log('3. Should have FULL ACCESS (no restriction messages)');
    console.log('4. Login as worker@test.com (Password: Password1706#)');
    console.log('5. Try accessing the same pages');
    console.log('6. Should have FULL ACCESS (no restriction messages)');
    console.log('\n💡 Organization has Growth subscription, so ALL users should have premium access!');

  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
