const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAllUsers() {
  try {
    console.log('🗑️ Deleting all user records in database...');
    
    // First, check what we're about to delete
    const usersCount = await prisma.user.count();
    const orgCount = await prisma.organization.count();
    const subCount = await prisma.subscription.count();
    
    console.log(`📊 Current database state:`);
    console.log(`   Users: ${usersCount}`);
    console.log(`   Organizations: ${orgCount}`);
    console.log(`   Subscriptions: ${subCount}`);
    
    if (usersCount === 0) {
      console.log('ℹ️ No users found in database. Nothing to delete.');
      return;
    }
    
    // Get list of users before deletion for confirmation
    const users = await prisma.user.findMany({
      select: { email: true, name: true, role: true }
    });
    
    console.log(`\n👥 Users to be deleted:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.name} - ${user.role})`);
    });
    
    // Delete subscriptions first (due to foreign key constraints)
    const deletedSubscriptions = await prisma.subscription.deleteMany({});
    console.log(`\n✅ Deleted ${deletedSubscriptions.count} subscription records`);
    
    // Delete users (this will cascade to related records)
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✅ Deleted ${deletedUsers.count} user records`);
    
    // Delete organizations (they should be empty now)
    const deletedOrgs = await prisma.organization.deleteMany({});
    console.log(`✅ Deleted ${deletedOrgs.count} organization records`);
    
    console.log(`\n🎉 Database cleanup completed successfully!`);
    console.log(`   Total deleted: ${deletedUsers.count} users, ${deletedOrgs.count} organizations, ${deletedSubscriptions.count} subscriptions`);
    
  } catch (error) {
    console.error('❌ Error deleting users:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllUsers();
