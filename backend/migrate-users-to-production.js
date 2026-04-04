const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Local database (source)
const localPrisma = new PrismaClient();

// Production database (target)
const PROD_DATABASE_URL = "postgresql://farmops_prod_user:oXkNxZdBXLXM7wxVOs9VhWj1o77Ap8gr@dpg-d6ute1hj16oc738tee1g-a.oregon-postgres.render.com:5432/farmops_prod";
const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: PROD_DATABASE_URL
    }
  }
});

async function migrateUsersToProduction() {
  try {
    console.log('🚀 Starting user migration to production...');
    
    // Get all users from local database
    const localUsers = await localPrisma.user.findMany({
      include: {
        organization: true
      }
    });
    
    console.log(`📊 Found ${localUsers.length} users in local database`);
    
    if (localUsers.length === 0) {
      console.log('❌ No users found in local database!');
      return;
    }
    
    // Get organizations from local
    const localOrgs = await localPrisma.organization.findMany();
    console.log(`📊 Found ${localOrgs.length} organizations in local database`);
    
    // First, create organizations in production
    console.log('🏢 Creating organizations in production...');
    for (const org of localOrgs) {
      try {
        await prodPrisma.organization.upsert({
          where: { id: org.id },
          update: {
            name: org.name,
            address: org.address,
            phone: org.phone,
            email: org.email,
            subscriptionPlan: org.subscriptionPlan,
            subscriptionStatus: org.subscriptionStatus,
            trialEndsAt: org.trialEndsAt,
            createdAt: org.createdAt,
            updatedAt: org.updatedAt
          },
          create: {
            id: org.id,
            name: org.name,
            address: org.address,
            phone: org.phone,
            email: org.email,
            subscriptionPlan: org.subscriptionPlan,
            subscriptionStatus: org.subscriptionStatus,
            trialEndsAt: org.trialEndsAt,
            createdAt: org.createdAt,
            updatedAt: org.updatedAt
          }
        });
        console.log(`✅ Created organization: ${org.name}`);
      } catch (error) {
        console.warn(`⚠️ Could not create organization ${org.name}:`, error.message);
      }
    }
    
    // Then, create users in production
    console.log('👥 Creating users in production...');
    for (const user of localUsers) {
      try {
        await prodPrisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name,
            password: user.password, // Already hashed
            role: user.role,
            organizationId: user.organizationId,
            address: user.address,
            phone: user.phone,
            profileImageUrl: user.profileImageUrl,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          create: {
            id: user.id,
            email: user.email,
            name: user.name,
            password: user.password, // Already hashed
            role: user.role,
            organizationId: user.organizationId,
            address: user.address,
            phone: user.phone,
            profileImageUrl: user.profileImageUrl,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        });
        console.log(`✅ Created user: ${user.email} (${user.name}, ${user.role})`);
      } catch (error) {
        console.warn(`⚠️ Could not create user ${user.email}:`, error.message);
      }
    }
    
    // Verify migration
    const prodUserCount = await prodPrisma.user.count();
    const prodOrgCount = await prodPrisma.organization.count();
    
    console.log('\n🎉 Migration completed!');
    console.log(`📊 Production database now has:`);
    console.log(`   - ${prodOrgCount} organizations`);
    console.log(`   - ${prodUserCount} users`);
    
    // Test kelechi specifically
    const kelechi = await prodPrisma.user.findUnique({
      where: { email: 'kelechi@super.com' }
    });
    
    if (kelechi) {
      console.log(`✅ SUCCESS: kelechi@super.com found in production!`);
      console.log(`   ID: ${kelechi.id}, Name: ${kelechi.name}, Role: ${kelechi.role}`);
    } else {
      console.log(`❌ ERROR: kelechi@super.com still not found in production`);
    }
    
    await localPrisma.$disconnect();
    await prodPrisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('❌ Full error:', error);
  }
}

migrateUsersToProduction();
