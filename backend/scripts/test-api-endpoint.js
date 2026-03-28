const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAPIEndpoint() {
  try {
    console.log('🔍 Testing API Endpoint Logic for "Today" Filter');
    
    // Simulate the exact API call parameters
    const startDate = '2026-03-28';
    const endDate = '2026-03-28';
    
    console.log(`📅 Date range: ${startDate} to ${endDate}`);
    
    // Simulate the exact date filtering logic from the backend
    const dateFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      // Set endDate to end of the day (23:59:59.999)
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter.lte = endOfDay;
    }
    
    console.log(`🔍 Date filter object:`, dateFilter);
    
    // Test with organization filter (simulate user access)
    const whereClause = {
      date: dateFilter
    };
    
    console.log(`🔍 Final where clause:`, whereClause);
    
    // Test the groupBy query
    const incomeByCategory = await prisma.incomeEntry.groupBy({
      by: ['category'],
      where: whereClause,
      _sum: { amount: true }
    });
    
    console.log(`📊 Income by Category result:`, incomeByCategory);
    
    // Also test with findMany to see what entries match
    const matchingEntries = await prisma.incomeEntry.findMany({
      where: whereClause,
      select: {
        id: true,
        amount: true,
        category: true,
        date: true
      }
    });
    
    console.log(`📋 Matching entries (${matchingEntries.length}):`);
    matchingEntries.forEach(entry => {
      console.log(`  Entry ${entry.id}: ₦${entry.amount.toLocaleString()}, ${entry.category}, ${entry.date}`);
    });
    
    // Test the date comparison directly
    const today = new Date('2026-03-28');
    const incomeDate = new Date('2026-03-28T11:16:21.000Z');
    
    console.log(`\n🕐 Date comparison test:`);
    console.log(`  Today start: ${today.toISOString()}`);
    console.log(`  Today end: ${new Date('2026-03-28').setHours(23, 59, 59, 999)}`);
    console.log(`  Income date: ${incomeDate.toISOString()}`);
    console.log(`  Income date >= today: ${incomeDate >= today}`);
    console.log(`  Income date <= endOfDay: ${incomeDate <= new Date('2026-03-28').setHours(23, 59, 59, 999)}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPIEndpoint();
