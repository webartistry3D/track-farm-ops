const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
  try {
    // Check income entries with their categories
    const incomeEntries = await prisma.incomeEntry.findMany({
      select: {
        id: true,
        amount: true,
        category: true,
        description: true,
        date: true
      }
    });
    
    console.log('📊 Income Entries and Categories:');
    incomeEntries.forEach(entry => {
      console.log(`  Entry ${entry.id}: Amount=${entry.amount}, Category='${entry.category}', Description='${entry.description}'`);
    });
    
    // Check expense entries with their categories
    const expenseEntries = await prisma.expenseEntry.findMany({
      select: {
        id: true,
        amount: true,
        category: true,
        note: true, // Use note instead of description for expenses
        date: true
      }
    });
    
    console.log('\n📊 Expense Entries and Categories:');
    expenseEntries.forEach(entry => {
      console.log(`  Entry ${entry.id}: Amount=${entry.amount}, Category='${entry.category}', Note='${entry.note}'`);
    });
    
    // Test the groupBy query that the backend uses
    console.log('\n🔍 Testing groupBy queries:');
    
    const incomeByCategory = await prisma.incomeEntry.groupBy({
      by: ['category'],
      _sum: { amount: true }
    });
    
    console.log('Income by Category (groupBy):', incomeByCategory);
    
    const expensesByCategory = await prisma.expenseEntry.groupBy({
      by: ['category'],
      _sum: { amount: true }
    });
    
    console.log('Expenses by Category (groupBy):', expensesByCategory);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
