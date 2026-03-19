/**
 * Database Seed Script for Organizations
 * Sets up proper organizational structure for FarmOps
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting organizational seed...');

  try {
    // Create Organizations
    console.log('📁 Creating organizations...');
    
    const kelechiOrg = await prisma.organization.upsert({
      where: { name: 'Kelechi Farms' },
      update: {},
      create: {
        name: 'Kelechi Farms',
        description: 'Kelechi\'s Agricultural Organization'
      }
    });

    const nnennaOrg = await prisma.organization.upsert({
      where: { name: 'Nnenna Farms' },
      update: {},
      create: {
        name: 'Nnenna Farms',
        description: 'Nnenna\'s Agricultural Organization'
      }
    });

    console.log(`✅ Created organizations: ${kelechiOrg.name} (ID: ${kelechiOrg.id}), ${nnennaOrg.name} (ID: ${nnennaOrg.id})`);

    // Create/Update Users with proper organization assignments
    console.log('👥 Creating/updating users...');

    // Kelechi Organization Users
    const kelechiOwner = await prisma.user.upsert({
      where: { email: 'keechi@owner.com' },
      update: {
        organizationId: kelechiOrg.id,
        role: 'OWNER'
      },
      create: {
        name: 'Kelechi Owner',
        email: 'keechi@owner.com',
        password: await bcrypt.hash('password123', 10),
        role: 'OWNER',
        organizationId: kelechiOrg.id
      }
    });

    const kelechiManager = await prisma.user.upsert({
      where: { email: 'kelechi@manager.com' },
      update: {
        organizationId: kelechiOrg.id,
        role: 'MANAGER',
        createdBy: kelechiOwner.id
      },
      create: {
        name: 'Kelechi Manager',
        email: 'kelechi@manager.com',
        password: await bcrypt.hash('password123', 10),
        role: 'MANAGER',
        organizationId: kelechiOrg.id,
        createdBy: kelechiOwner.id
      }
    });

    const kelechiWorker = await prisma.user.upsert({
      where: { email: 'kelechi@worker.com' },
      update: {
        organizationId: kelechiOrg.id,
        role: 'WORKER',
        createdBy: kelechiOwner.id
      },
      create: {
        name: 'Kelechi Worker',
        email: 'kelechi@worker.com',
        password: await bcrypt.hash('password123', 10),
        role: 'WORKER',
        organizationId: kelechiOrg.id,
        createdBy: kelechiOwner.id
      }
    });

    // Nnenna Organization Users
    const nnennaOwner = await prisma.user.upsert({
      where: { email: 'nnenna@owner.com' },
      update: {
        organizationId: nnennaOrg.id,
        role: 'OWNER'
      },
      create: {
        name: 'Nnenna Owner',
        email: 'nnenna@owner.com',
        password: await bcrypt.hash('password123', 10),
        role: 'OWNER',
        organizationId: nnennaOrg.id
      }
    });

    const nnennaManager = await prisma.user.upsert({
      where: { email: 'nnenna@manager.com' },
      update: {
        organizationId: nnennaOrg.id,
        role: 'MANAGER',
        createdBy: nnennaOwner.id
      },
      create: {
        name: 'Nnenna Manager',
        email: 'nnenna@manager.com',
        password: await bcrypt.hash('password123', 10),
        role: 'MANAGER',
        organizationId: nnennaOrg.id,
        createdBy: nnennaOwner.id
      }
    });

    const nnennaWorker = await prisma.user.upsert({
      where: { email: 'nnenna@worker.com' },
      update: {
        organizationId: nnennaOrg.id,
        role: 'WORKER',
        createdBy: nnennaOwner.id
      },
      create: {
        name: 'Nnenna Worker',
        email: 'nnenna@worker.com',
        password: await bcrypt.hash('password123', 10),
        role: 'WORKER',
        organizationId: nnennaOrg.id,
        createdBy: nnennaOwner.id
      }
    });

    console.log('✅ Created/updated users:');

    console.log('🏢 Kelechi Farms Organization:');
    console.log(`  👑 OWNER: ${kelechiOwner.name} (${kelechiOwner.email}) - ID: ${kelechiOwner.id}`);
    console.log(`  👨‍💼 MANAGER: ${kelechiManager.name} (${kelechiManager.email}) - ID: ${kelechiManager.id}`);
    console.log(`  👷 WORKER: ${kelechiWorker.name} (${kelechiWorker.email}) - ID: ${kelechiWorker.id}`);

    console.log('🏢 Nnenna Farms Organization:');
    console.log(`  👑 OWNER: ${nnennaOwner.name} (${nnennaOwner.email}) - ID: ${nnennaOwner.id}`);
    console.log(`  👨‍💼 MANAGER: ${nnennaManager.name} (${nnennaManager.email}) - ID: ${nnennaManager.id}`);
    console.log(`  👷 WORKER: ${nnennaWorker.name} (${nnennaWorker.email}) - ID: ${nnennaWorker.id}`);

    // Verify the setup
    console.log('\n🔍 Verifying organizational setup...');

    const kelechiUsers = await prisma.user.findMany({
      where: { organizationId: kelechiOrg.id },
      select: { id: true, name: true, email: true, role: true }
    });

    const nnennaUsers = await prisma.user.findMany({
      where: { organizationId: nnennaOrg.id },
      select: { id: true, name: true, email: true, role: true }
    });

    console.log(`📊 Kelechi Farms has ${kelechiUsers.length} users:`, kelechiUsers.map(u => `${u.name} (${u.role})`));
    console.log(`📊 Nnenna Farms has ${nnennaUsers.length} users:`, nnennaUsers.map(u => `${u.name} (${u.role})`));

    console.log('\n🎉 Organizational setup completed successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('Email: keechi@owner.com | Password: password123');
    console.log('Email: kelechi@manager.com | Password: password123');
    console.log('Email: kelechi@worker.com | Password: password123');
    console.log('Email: nnenna@owner.com | Password: password123');
    console.log('Email: nnenna@manager.com | Password: password123');
    console.log('Email: nnenna@worker.com | Password: password123');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
