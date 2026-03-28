const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDateFilter() {
  try {
    // Get current date range that Analytics Dashboard might be using
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    console.log('📅 Testing with current month date range:');
    console.log(`  Start: ${firstDayOfMonth.toISOString().split('T')[0]}`);
    console.log(`  End: ${lastDayOfMonth.toISOString().split('T')[0]}`);

    // Test the same query as the backend with date filter
    const dateFilter = {
      gte: firstDayOfMonth,
      lte: lastDayOfMonth
    };

    console.log('\n🔍 Testing income groupBy with date filter:');
    const incomeByCategory = await prisma.incomeEntry.groupBy({
      by: ['category'],
      where: {
        date: dateFilter
      },
      _sum: { amount: true }
    });
    
    console.log('Income by Category (with date filter):', incomeByCategory);

    console.log('\n🔍 Testing expense groupBy with date filter:');
    const expensesByCategory = await prisma.expenseEntry.groupBy({
      by: ['category'],
      where: {
        date: dateFilter
      },
      _sum: { amount: true }
    });
    
    console.log('Expenses by Category (with date filter):', expensesByCategory);

    // Test without date filter
    console.log('\n🔍 Testing without date filter:');
    const incomeByCategoryNoFilter = await prisma.incomeEntry.groupBy({
      by: ['category'],
      _sum: { amount: true }
    });
    
    console.log('Income by Category (no date filter):', incomeByCategoryNoFilter);

    const expensesByCategoryNoFilter = await prisma.expenseEntry.groupBy({
      by: ['category'],
      _sum: { amount: true }
    });
    
    console.log('Expenses by Category (no date filter):', expensesByCategoryNoFilter);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDateFilter();
