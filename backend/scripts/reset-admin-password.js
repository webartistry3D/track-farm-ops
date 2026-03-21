const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function resetAdminPassword() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔑 Resetting admin password...');
    
    // Find admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'kelechi@owner.com' }
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    // Hash new password
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Admin password reset successfully!');
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`🔑 New Password: ${newPassword}`);
    console.log(`👤 User ID: ${adminUser.id}`);
    
  } catch (error) {
    console.error('❌ Password reset failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  resetAdminPassword();
}

module.exports = { resetAdminPassword };
