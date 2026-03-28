const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugTodayFilter() {
  try {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    console.log('🔍 Debugging Today Filter:');
    console.log(`  Today's date: ${todayString}`);
    console.log(`  Today's full date: ${today.toISOString()}`);

    // Check all income entries with their dates
    const incomeEntries = await prisma.incomeEntry.findMany({
      select: {
        id: true,
        amount: true,
        category: true,
        date: true,
        createdAt: true
      }
    });
    
    console.log('\n📊 All Income Entries:');
    incomeEntries.forEach(entry => {
      const entryDate = new Date(entry.date).toISOString().split('T')[0];
      const matchesToday = entryDate === todayString;
      console.log(`  Entry ${entry.id}:`);
      console.log(`    Amount: ₦${entry.amount.toLocaleString()}`);
      console.log(`    Date (stored): ${entry.date}`);
      console.log(`    Date (formatted): ${entryDate}`);
      console.log(`    Matches today: ${matchesToday ? '✅' : '❌'}`);
      console.log(`    Created at: ${entry.createdAt}`);
    });

    // Test the exact query the backend uses for "today"
    console.log('\n🔍 Testing backend "today" query:');
    const todayStart = new Date(todayString);
    const todayEnd = new Date(todayString);
    
    console.log(`  Query range: ${todayStart.toISOString()} to ${todayEnd.toISOString()}`);

    const incomeToday = await prisma.incomeEntry.groupBy({
      by: ['category'],
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      _sum: { amount: true }
    });
    
    console.log('Income by Category (today filter):', incomeToday);

    // Test with date string comparison
    console.log('\n🔍 Testing with date string comparison:');
    const incomeTodayString = await prisma.incomeEntry.groupBy({
      by: ['category'],
      where: {
        date: todayString
      },
      _sum: { amount: true }
    });
    
    console.log('Income by Category (date string):', incomeTodayString);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTodayFilter();
