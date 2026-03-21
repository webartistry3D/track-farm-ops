const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function seedProduction() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🌱 Seeding production database...');
    
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'kelechi@owner.com' }
    });
    
    if (existingUser) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    // Create default organization
    const organization = await prisma.organization.upsert({
      where: { name: 'default' },
      update: {},
      create: {
        name: 'default',
        description: 'Default organization'
      }
    });
    
    // Create admin user
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
    console.log(`📧 Email: kelechi@owner.com`);
    console.log(`🔑 Password: admin123`);
    console.log(`🏢 Organization: ${organization.name}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedProduction();
}

module.exports = { seedProduction };
