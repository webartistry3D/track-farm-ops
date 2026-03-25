const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createKelechiUser() {
  try {
    console.log('🔧 Creating kelechi@owner.com user...\n');

    // First create an organization for the user
    const organization = await prisma.organization.findFirst({
      where: { name: 'Default Farm' }
    });

    let orgId;
    if (!organization) {
      const newOrg = await prisma.organization.create({
        data: {
          name: 'Default Farm',
          description: 'Default farm organization for local development'
        }
      });
      orgId = newOrg.id;
      console.log(`✅ Created organization: ${newOrg.name} (ID: ${newOrg.id})`);
    } else {
      orgId = organization.id;
      console.log(`✅ Using existing organization: ${organization.name} (ID: ${organization.id})`);
    }

    // Create the user
    const hashedPassword = await bcrypt.hash('Password1706#', 10);
    
    const existingUser = await prisma.user.findUnique({
      where: { email: 'kelechi@owner.com' }
    });
    
    if (existingUser) {
      console.log('✅ User kelechi@owner.com already exists');
    } else {
      const user = await prisma.user.create({
        data: {
          name: 'Kelechi Owner',
          email: 'kelechi@owner.com',
          password: hashedPassword,
          role: 'OWNER',
          organizationId: orgId
        }
      });
      
      console.log(`✅ Created user: ${user.name} (${user.email}) with role ${user.role}`);
    }

    console.log('\n🎉 User setup complete!');
    console.log('📝 Login credentials:');
    console.log('   Email: kelechi@owner.com');
    console.log('   Password: Password1706#');

  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createKelechiUser();
