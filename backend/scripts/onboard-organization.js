const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { seedSystemInventoryForOrganization } = require('../prisma/seed-inventory');

const prisma = new PrismaClient();

// ============================================
// 🏢 CUSTOMIZE YOUR ORGANIZATION DETAILS HERE
// ============================================

const ORGANIZATION_CONFIG = {
  name: 'Your Farm Name',
  description: 'Your farm description here',
};

const OWNER_CONFIG = {
  name: 'Owner Name',
  email: 'owner@yourfarm.com',
  password: 'your-secure-password', // Change this to a secure password
};

const MANAGERS_CONFIG = [
  {
    name: 'Manager 1 Name',
    email: 'manager1@yourfarm.com',
    password: 'manager1-password', // Change this to a secure password
  },
  {
    name: 'Manager 2 Name',
    email: 'manager2@yourfarm.com',
    password: 'manager2-password', // Change this to a secure password
  },
  // Add more managers as needed
];

const WORKERS_CONFIG = [
  {
    name: 'Worker 1 Name',
    email: 'worker1@yourfarm.com',
    password: 'worker1-password', // Change this to a secure password
  },
  {
    name: 'Worker 2 Name',
    email: 'worker2@yourfarm.com',
    password: 'worker2-password', // Change this to a secure password
  },
  {
    name: 'Worker 3 Name',
    email: 'worker3@yourfarm.com',
    password: 'worker3-password', // Change this to a secure password
  },
  // Add more workers as needed
];

// ============================================
// 🚀 ONBOARDING SCRIPT - DO NOT MODIFY BELOW
// ============================================

async function createOrganization() {
  console.log('🏢 Creating organization...');

  try {
    const organization = await prisma.organization.create({
      data: {
        name: ORGANIZATION_CONFIG.name,
        description: ORGANIZATION_CONFIG.description,
      },
    });

    console.log(`✅ Created organization: ${organization.name} (ID: ${organization.id})`);
    return organization;
  } catch (error) {
    console.error('❌ Error creating organization:', error);
    return null;
  }
}

async function createOwner(organizationId) {
  console.log('👤 Creating owner...');

  try {
    const hashedPassword = await bcrypt.hash(OWNER_CONFIG.password, 12);

    const owner = await prisma.user.create({
      data: {
        name: OWNER_CONFIG.name,
        email: OWNER_CONFIG.email,
        password: hashedPassword,
        role: 'OWNER',
        organizationId,
      },
    });

    console.log(`✅ Created owner: ${owner.name} (${owner.email})`);
    return owner;
  } catch (error) {
    console.error('❌ Error creating owner:', error);
    return null;
  }
}

async function createManagers(organizationId) {
  console.log(`👥 Creating ${MANAGERS_CONFIG.length} managers...`);

  const managers = [];

  for (const managerConfig of MANAGERS_CONFIG) {
    try {
      const hashedPassword = await bcrypt.hash(managerConfig.password, 12);

      const manager = await prisma.user.create({
        data: {
          name: managerConfig.name,
          email: managerConfig.email,
          password: hashedPassword,
          role: 'MANAGER',
          organizationId,
        },
      });

      console.log(`✅ Created manager: ${manager.name} (${manager.email})`);
      managers.push(manager);
    } catch (error) {
      console.error(`❌ Error creating manager ${managerConfig.name}:`, error);
    }
  }

  return managers;
}

async function createWorkers(organizationId) {
  console.log(`👥 Creating ${WORKERS_CONFIG.length} workers...`);

  const workers = [];

  for (const workerConfig of WORKERS_CONFIG) {
    try {
      const hashedPassword = await bcrypt.hash(workerConfig.password, 12);

      const worker = await prisma.user.create({
        data: {
          name: workerConfig.name,
          email: workerConfig.email,
          password: hashedPassword,
          role: 'WORKER',
          organizationId,
        },
      });

      console.log(`✅ Created worker: ${worker.name} (${worker.email})`);
      workers.push(worker);
    } catch (error) {
      console.error(`❌ Error creating worker ${workerConfig.name}:`, error);
    }
  }

  return workers;
}

async function main() {
  console.log('🚀 Starting organization onboarding process...\n');

  try {
    // Create organization
    const organization = await createOrganization();
    if (!organization) {
      console.error('❌ Failed to create organization');
      return;
    }

    // Create owner
    const owner = await createOwner(organization.id);
    if (!owner) {
      console.error('❌ Failed to create owner');
      return;
    }

    // Create managers
    const managers = await createManagers(organization.id);
    if (managers.length === 0) {
      console.error('❌ Failed to create any managers');
      return;
    }

    // Create workers
    const workers = await createWorkers(organization.id);
    if (workers.length === 0) {
      console.warn('⚠️ No workers were created (this might be intentional)');
    }

    // Seed inventory for the organization
    console.log('\n📦 Seeding inventory...');
    const seedingSuccess = await seedSystemInventoryForOrganization(organization.id);
    if (!seedingSuccess) {
      console.error('❌ Failed to seed inventory');
      return;
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('🎊 ORGANIZATION ONBOARDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📋 ORGANIZATION DETAILS:');
    console.log(`   Name: ${organization.name}`);
    console.log(`   ID: ${organization.id}`);
    console.log(`   Description: ${organization.description}`);

    console.log('\n👤 OWNER CREDENTIALS:');
    console.log(`   Name: ${owner.name}`);
    console.log(`   Email: ${owner.email}`);
    console.log(`   Password: ${OWNER_CONFIG.password}`);

    console.log('\n👥 MANAGER CREDENTIALS:');
    managers.forEach((manager, index) => {
      console.log(`   ${index + 1}. ${manager.name}`);
      console.log(`      Email: ${manager.email}`);
      console.log(`      Password: ${MANAGERS_CONFIG[index].password}`);
    });

    console.log('\n👥 WORKER CREDENTIALS:');
    workers.forEach((worker, index) => {
      console.log(`   ${index + 1}. ${worker.name}`);
      console.log(`      Email: ${worker.email}`);
      console.log(`      Password: ${WORKERS_CONFIG[index].password}`);
    });

    console.log('\n📦 INVENTORY:');
    console.log(`   8 categories seeded`);
    console.log(`   40 items seeded`);
    console.log('\n⚠️ IMPORTANT: Change all passwords immediately after first login!\n');

  } catch (error) {
    console.error('❌ Onboarding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the onboarding
main();