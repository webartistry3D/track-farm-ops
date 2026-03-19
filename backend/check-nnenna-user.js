const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkNnennaUser() {
  try {
    console.log('🔍 Checking for user: nnenna@owner.com');
    
    const user = await prisma.user.findUnique({
      where: { email: 'nnenna@owner.com' },
      include: { organization: true }
    });
    
    if (user) {
      console.log('✅ User found:');
      console.log('   Email:', user.email);
      console.log('   Name:', user.name);
      console.log('   Role:', user.role);
      console.log('   Organization:', user.organization?.name || 'None');
      console.log('   Organization ID:', user.organizationId || 'None');
      console.log('   Status:', user.status || 'No status field');
      console.log('   Created:', user.createdAt);
      console.log('   Password Hash Length:', user.password ? user.password.length : 'No password');
    } else {
      console.log('❌ User NOT found in database');
    }
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkNnennaUser();
