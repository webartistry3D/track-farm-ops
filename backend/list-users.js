const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listAllUsers() {
  console.log('👥 All Users in Database\n');
  
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        createdAt: true,
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Organization: ${user.organization?.name || 'None'} (${user.organizationId})`);
      console.log(`   Created: ${user.createdAt.toLocaleString()}`);
      console.log('');
    });
    
    console.log(`📊 Total Users: ${users.length}`);
    console.log(`🔐 Default password for test users: password123`);
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAllUsers();
