const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugAllDateFilters() {
  try {
    const today = new Date();
    console.log('🔍 Debugging All Date Filters:');
    console.log(`  Current date: ${today.toISOString().split('T')[0]}`);

    // Test all date ranges like the frontend does
    const dateRanges = {
      today: {
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      },
      yesterday: {
        startDate: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      week: {
        startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      },
      month: {
        startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      },
      allTime: {
        startDate: '',
        endDate: ''
      }
    };

    // Check all income entries first
    const allIncome = await prisma.incomeEntry.findMany({
      select: {
        id: true,
        amount: true,
        category: true,
        date: true
      }
    });

    console.log('\n📊 All Income Entries:');
    allIncome.forEach(entry => {
      console.log(`  Entry ${entry.id}: ₦${entry.amount.toLocaleString()}, ${entry.category}, ${entry.date}`);
    });

    // Test each date filter
    for (const [filterName, range] of Object.entries(dateRanges)) {
      console.log(`\n🔍 Testing "${filterName}" filter:`);
      console.log(`  Range: ${range.startDate} to ${range.endDate}`);
      
      let whereClause = {};
      if (range.startDate && range.endDate) {
        const start = new Date(range.startDate);
        const end = new Date(range.endDate);
        end.setHours(23, 59, 59, 999);
        whereClause = { date: { gte: start, lte: end } };
      }

      const result = await prisma.incomeEntry.groupBy({
        by: ['category'],
        where: whereClause,
        _sum: { amount: true }
      });

      console.log(`  Result:`, result);
      
      // Also test with findMany to see what entries are included
      const entriesInRange = await prisma.incomeEntry.findMany({
        where: whereClause,
        select: {
          id: true,
          amount: true,
          category: true,
          date: true
        }
      });
      
      console.log(`  Entries in range (${entriesInRange.length}):`);
      entriesInRange.forEach(entry => {
        console.log(`    ${entry.id}: ₦${entry.amount.toLocaleString()}, ${entry.date}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAllDateFilters();
