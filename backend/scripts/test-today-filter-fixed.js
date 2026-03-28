const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testTodayFilterFixed() {
  try {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    console.log('🔍 Testing Fixed Today Filter:');
    console.log(`  Today's date: ${todayString}`);

    // Test the FIXED query with end of day
    const todayStart = new Date(todayString);
    const todayEnd = new Date(todayString);
    todayEnd.setHours(23, 59, 59, 999);
    
    console.log(`  Fixed query range: ${todayStart.toISOString()} to ${todayEnd.toISOString()}`);

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
    
    console.log('Income by Category (fixed today filter):', incomeToday);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTodayFilterFixed();
