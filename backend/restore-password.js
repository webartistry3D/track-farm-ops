const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function restorePassword() {
  try {
    console.log('🔧 Restoring original password for keechi@owner.com...');
    
    // Hash the original password
    const originalPassword = 'Password1706#';
    const hashedPassword = await bcrypt.hash(originalPassword, 12);
    
    console.log('🔐 Updating password in database...');
    
    // Update the user's password
    const updatedUser = await prisma.user.update({
      where: { email: 'keechi@owner.com' },
      data: { password: hashedPassword },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true
      }
    });
    
    console.log('✅ Password restored successfully!');
    console.log('👤 User:', updatedUser.name, '(', updatedUser.email, ')');
    console.log('🔑 New password: Password1706#');
    
    // Verify the password works
    console.log('\n🔍 Verifying password...');
    const user = await prisma.user.findUnique({
      where: { email: 'keechi@owner.com' },
      select: { password: true }
    });
    
    const isValid = await bcrypt.compare(originalPassword, user.password);
    console.log('✅ Password verification:', isValid ? 'SUCCESS' : 'FAILED');
    
  } catch (error) {
    console.error('❌ Error restoring password:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

restorePassword();
