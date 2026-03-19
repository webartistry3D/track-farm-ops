const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteKelechiUser() {
  try {
    console.log('🗑️ Deleting kelechi@owner.com user...');
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: 'kelechi@owner.com' },
      include: { organization: true }
    });
    
    if (user) {
      console.log('📋 User to delete:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Organization: ${user.organization?.name || 'None'}`);
      
      // Delete the user (this will cascade delete related records)
      await prisma.user.delete({
        where: { email: 'kelechi@owner.com' }
      });
      
      console.log('✅ User deleted successfully!');
    } else {
      console.log('ℹ️ User not found');
    }
    
    // Verify deletion
    const remainingUsers = await prisma.user.count({
      where: { email: 'kelechi@owner.com' }
    });
    console.log(`📊 Remaining kelechi@owner.com users: ${remainingUsers}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteKelechiUser();
