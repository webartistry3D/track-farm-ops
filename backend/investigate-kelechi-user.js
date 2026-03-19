const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function investigateUser() {
  try {
    console.log('🔍 Investigating kelechi@owner.com account creation');
    
    const user = await prisma.user.findUnique({
      where: { email: 'kelechi@owner.com' },
      include: { organization: true }
    });
    
    if (user) {
      console.log('✅ User details:');
      console.log('   Email:', user.email);
      console.log('   Name:', user.name);
      console.log('   Role:', user.role);
      console.log('   Created at:', user.createdAt);
      console.log('   Updated at:', user.updatedAt);
      
      // Check if this looks like a recent creation
      const now = new Date();
      const createdTime = new Date(user.createdAt);
      const hoursDiff = (now - createdTime) / (1000 * 60 * 60);
      
      console.log('   Hours since creation:', hoursDiff.toFixed(2));
      
      if (hoursDiff < 1) {
        console.log('   🆕 User was created very recently (within last hour)');
      }
      
      // Check all users to see creation pattern
      console.log('\n📋 All users (most recent first):');
      const allUsers = await prisma.user.findMany({
        select: { 
          email: true, 
          name: true, 
          role: true, 
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      });
      
      allUsers.forEach((u, index) => {
        const created = new Date(u.createdAt);
        console.log(`   ${index + 1}. ${u.email}`);
        console.log(`      Name: ${u.name || 'No name'}`);
        console.log(`      Role: ${u.role}`);
        console.log(`      Created: ${created.toLocaleString()}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

investigateUser();
