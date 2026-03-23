const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetSpecificPasswords() {
  try {
    console.log('🔧 Resetting passwords for Manager and Worker accounts...\n');
    
    // Get the working password hash from Owner account
    const owner = await prisma.user.findUnique({
      where: { email: 'kelechi@owner.com' }
    });
    
    if (!owner) {
      console.log('❌ Owner account not found');
      return;
    }
    
    console.log(`✅ Found Owner account: ${owner.name}`);
    console.log(`   Password hash: ${owner.password.substring(0, 20)}...`);
    
    // Test the owner password
    const ownerPasswordValid = await bcrypt.compare('admin123', owner.password);
    console.log(`   "admin123" verification: ${ownerPasswordValid ? '✅ Valid' : '❌ Invalid'}`);
    
    // Reset Manager account password
    const manager = await prisma.user.findUnique({
      where: { email: 'kelechi@manager.com' }
    });
    
    if (manager) {
      console.log(`\n👤 Resetting Manager account: ${manager.name}`);
      
      // Hash the same password as owner
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await prisma.user.update({
        where: { id: manager.id },
        data: { password: hashedPassword }
      });
      
      console.log(`✅ Manager password reset`);
      
      // Test the new password
      const updatedManager = await prisma.user.findUnique({ where: { id: manager.id } });
      const managerPasswordValid = await bcrypt.compare('admin123', updatedManager.password);
      console.log(`   "admin123" verification: ${managerPasswordValid ? '✅ Valid' : '❌ Invalid'}`);
    }
    
    // Reset Worker account password
    const worker = await prisma.user.findUnique({
      where: { email: 'kelechi@worker.com' }
    });
    
    if (worker) {
      console.log(`\n👤 Resetting Worker account: ${worker.name}`);
      
      // Hash the same password as owner
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await prisma.user.update({
        where: { id: worker.id },
        data: { password: hashedPassword }
      });
      
      console.log(`✅ Worker password reset`);
      
      // Test the new password
      const updatedWorker = await prisma.user.findUnique({ where: { id: worker.id } });
      const workerPasswordValid = await bcrypt.compare('admin123', updatedWorker.password);
      console.log(`   "admin123" verification: ${workerPasswordValid ? '✅ Valid' : '❌ Invalid'}`);
    }
    
    console.log('\n🎉 Password reset completed!');
    console.log('\n📋 Login Credentials:');
    console.log('👤 Owner: kelechi@owner.com / admin123');
    console.log('👤 Manager: kelechi@manager.com / admin123');
    console.log('👤 Worker: kelechi@worker.com / admin123');
    
  } catch (error) {
    console.error('❌ Password reset failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetSpecificPasswords();
