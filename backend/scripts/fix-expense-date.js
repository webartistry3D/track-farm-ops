const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixExpenseDate() {
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

    // Update the date to current month (March 28, 2026)
    const newDate = new Date('2026-03-28');
    
    await prisma.expenseEntry.update({
      where: { id: expense.id },
      data: {
        date: newDate
      }
    });

    console.log(`✅ Updated expense date to: ${newDate.toISOString().split('T')[0]}`);

    // Test the groupBy again
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const dateFilter = {
      gte: firstDayOfMonth,
      lte: lastDayOfMonth
    };

    const expensesByCategory = await prisma.expenseEntry.groupBy({
      by: ['category'],
      where: {
        date: dateFilter
      },
      _sum: { amount: true }
    });
    
    console.log('\n🔍 Expenses by Category (with updated date):', expensesByCategory);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixExpenseDate();
