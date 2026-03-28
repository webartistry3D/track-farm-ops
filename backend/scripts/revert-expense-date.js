const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function revertExpenseDate() {
  try {
    // Find the expense entry
    const expense = await prisma.expenseEntry.findFirst({
      select: {
        id: true,
        amount: true,
        category: true,
        date: true,
        note: true
      }
    });

    if (!expense) {
      console.log('❌ No expense entry found');
      return;
    }

    console.log(`📊 Current expense entry:`);
    console.log(`  ID: ${expense.id}`);
    console.log(`  Amount: ₦${expense.amount.toLocaleString()}`);
    console.log(`  Category: ${expense.category}`);
    console.log(`  Current Date: ${expense.date}`);

    // Revert the date back to original 11/14/2025
    const originalDate = new Date('2025-11-14');
    
    await prisma.expenseEntry.update({
      where: { id: expense.id },
      data: {
        date: originalDate
      }
    });

    console.log(`✅ Reverted expense date back to: ${originalDate.toISOString().split('T')[0]}`);

    // Test the groupBy with different date ranges
    console.log('\n🔍 Testing date ranges:');
    
    // Test "All Time" (should show the expense)
    const expensesAllTime = await prisma.expenseEntry.groupBy({
      by: ['category'],
      _sum: { amount: true }
    });
    
    console.log('All Time Expenses:', expensesAllTime);

    // Test "Last 30 Days" (should NOT show the expense)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const expensesLast30Days = await prisma.expenseEntry.groupBy({
      by: ['category'],
      where: {
        date: {
          gte: thirtyDaysAgo,
          lte: today
        }
      },
      _sum: { amount: true }
    });
    
    console.log('Last 30 Days Expenses:', expensesLast30Days);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

revertExpenseDate();
