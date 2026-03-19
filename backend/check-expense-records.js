const { PrismaClient } = require('@prisma/client');

async function checkExpenseRecords() {
  console.log('🔍 Checking expense records in database...\n');
  
  const prisma = new PrismaClient();
  
  try {
    // Count all expense records
    const totalExpenses = await prisma.expenseEntry.count();
    console.log(`📊 Total expense records: ${totalExpenses}`);
    
    if (totalExpenses > 0) {
      // Get first few records
      const expenses = await prisma.expenseEntry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          category: true,
          note: true,
          date: true,
          createdAt: true,
          userId: true,
          merchant: true
        }
      });
      
      console.log('\n📋 Recent expense records:');
      expenses.forEach((expense, index) => {
        console.log(`${index + 1}. ${expense.note} - ${expense.amount} (${expense.category})`);
      });
    } else {
      console.log('❌ No expense records found in database');
      console.log('💡 You need to create some expense records first');
    }
    
  } catch (error) {
    console.error('❌ Database query failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkExpenseRecords();
