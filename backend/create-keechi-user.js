const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createKeechiUser() {
  console.log('👤 Creating user: keechi@owner.com\n');
  
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'keechi@owner.com' }
    });

    if (existingUser) {
      console.log('ℹ️  User already exists: keechi@owner.com');
      console.log('   Resetting password to: password123');
      
      // Update password
      const hashedPassword = await bcrypt.hash('password123', 12);
      await prisma.user.update({
        where: { email: 'keechi@owner.com' },
        data: { password: hashedPassword }
      });
      
      console.log('✅ Password reset successfully');
      
    } else {
      console.log('🆕 Creating new user...');
      
      // Create organization first
      const organization = await prisma.organization.create({
        data: {
          name: "Keechi's Farm"
        }
      });
      
      console.log(`✅ Created organization: ${organization.name} (ID: ${organization.id})`);
      
      // Create user
      const hashedPassword = await bcrypt.hash('password123', 12);
      const user = await prisma.user.create({
        data: {
          name: 'Keechi',
          email: 'keechi@owner.com',
          password: hashedPassword,
          role: 'OWNER',
          organizationId: organization.id
        },
        include: {
          organization: true
        }
      });
      
      console.log(`✅ Created user: ${user.name} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Organization: ${user.organization.name}`);
      console.log(`   Password: password123`);
    }
    
    console.log('\n🎯 Login Credentials:');
    console.log('   Email: keechi@owner.com');
    console.log('   Password: password123');
    console.log('\n✅ You should now be able to login successfully!');
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createKeechiUser();
