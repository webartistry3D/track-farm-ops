const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrganization() {
  try {
    console.log('🔍 Checking Organization Data');
    
    // Get all users and their organizations
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    console.log('👥 Users and Organizations:');
    users.forEach(user => {
      console.log(`  User ${user.id} (${user.name}): Org ID ${user.organizationId}, Org ${user.organization?.name}`);
    });
    
    // Get all income entries with their organization
    const incomeEntries = await prisma.incomeEntry.findMany({
      select: {
        id: true,
        amount: true,
        category: true,
        date: true,
        userId: true,
        organizationId: true
      }
    });
    
    console.log('\n💰 Income Entries and Organizations:');
    incomeEntries.forEach(entry => {
      console.log(`  Entry ${entry.id}: ₦${entry.amount.toLocaleString()}, User ID ${entry.userId}, Org ID ${entry.organizationId}`);
    });
    
    // Test the exact query the backend uses with organization filtering
    console.log('\n🔍 Testing API query with organization filtering:');
    
    // Simulate current user (let's assume user ID 1)
    const currentUser = await prisma.user.findFirst({
      select: {
        id: true,
        name: true,
        role: true,
        organizationId: true
      }
    });
    
    if (!currentUser) {
      console.log('❌ No users found');
      return;
    }
    
    console.log(`👤 Current user: ${currentUser.name} (ID: ${currentUser.id}, Role: ${currentUser.role}, Org ID: ${currentUser.organizationId})`);
    
    // Build the exact where clause the backend uses
    let userIds = [];
    if (currentUser.role === 'OWNER') {
      // Owners see data from themselves and all users they created
      const orgUsers = await prisma.user.findMany({
        where: {
          organizationId: currentUser.organizationId
        },
        select: { id: true }
      });
      userIds = orgUsers.map(u => u.id);
    } else {
      userIds = [currentUser.id];
    }
    
    const dateFilter = {
      gte: new Date('2026-03-28'),
      lte: new Date('2026-03-28').setHours(23, 59, 59, 999)
    };
    
    const whereClause = {
      userId: { in: userIds },
      organizationId: currentUser.organizationId,
      date: dateFilter
    };
    
    console.log(`🔍 Final where clause:`, whereClause);
    
    const result = await prisma.incomeEntry.groupBy({
      by: ['category'],
      where: whereClause,
      _sum: { amount: true }
    });
    
    console.log(`📊 Final result:`, result);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrganization();
