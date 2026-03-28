const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkIncomeDate() {
  try {
    console.log('🔍 Checking actual income entry dates');
    
    // Get all income entries
    const incomeEntries = await prisma.incomeEntry.findMany({
      select: {
        id: true,
        amount: true,
        category: true,
        date: true,
        userId: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { date: 'desc' }
    });
    
    console.log(`📋 Found ${incomeEntries.length} income entries:`);
    incomeEntries.forEach(entry => {
      console.log(`  Entry ${entry.id}:`);
      console.log(`    Amount: ₦${entry.amount.toLocaleString()}`);
      console.log(`    Category: ${entry.category}`);
      console.log(`    Date: ${entry.date.toISOString()}`);
      console.log(`    Created: ${entry.createdAt.toISOString()}`);
      console.log(`    User ID: ${entry.userId}`);
      console.log(`    Org ID: ${entry.organizationId}`);
      console.log('');
    });
    
    // Test today's filter specifically
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    
    console.log(`🗓️ Today's date range:`);
    console.log(`  Start: ${todayStart.toISOString()}`);
    console.log(`  End: ${todayEnd.toISOString()}`);
    
    // Find entries for today
    const todayEntries = incomeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= todayStart && entryDate <= todayEnd;
    });
    
    console.log(`📊 Entries for today (${todayEntries.length}):`);
    todayEntries.forEach(entry => {
      console.log(`  Entry ${entry.id}: ₦${entry.amount.toLocaleString()} - ${entry.date.toISOString()}`);
    });
    
    // Test the exact API query
    console.log(`\n🔍 Testing API query for today:`);
    const apiResult = await prisma.incomeEntry.groupBy({
      by: ['category'],
      where: {
        userId: { in: [1, 2, 3, 4] },
        organizationId: 1,
        date: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      _sum: { amount: true }
    });
    
    console.log(`📊 API Result:`, apiResult);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkIncomeDate();
