import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserPassword() {
  try {
    console.log('Checking user credentials for kelechi@owner.com...');

    const user = await prisma.user.findUnique({
      where: { email: 'kelechi@owner.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true
          }
        }
        // Note: We can't select password hash for security reasons
      }
    });

    if (user) {
      console.log('User found:');
      console.log('=============');
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Role: ${user.role}`);
      console.log(`Organization: ${user.organization?.name || 'None'}`);
      console.log(`Organization ID: ${user.organizationId}`);
    } else {
      console.log('User kelechi@owner.com not found in the database.');
    }

    // Let's also list all users to see what's available
    console.log('\nAll users in database:');
    console.log('=====================');
    
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
        organization: {
          select: {
            name: true
          }
        }
      },
      orderBy: { email: 'asc' }
    });

    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name}) - ${user.role} - ${user.organization?.name || 'No org'}`);
    });

  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserPassword();
