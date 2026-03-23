const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeDuplicates() {
  try {
    console.log('🧹 Removing duplicate entries from database...\n');
    
    // 1. Remove duplicate Income Entries
    console.log('💰 Cleaning Income Entries...');
    const allIncome = await prisma.incomeEntry.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    const incomeGroups = {};
    allIncome.forEach(income => {
      const key = `${income.amount}-${income.category}-${income.description}-${income.date}`;
      if (!incomeGroups[key]) {
        incomeGroups[key] = [];
      }
      incomeGroups[key].push(income);
    });
    
    let incomeDeleted = 0;
    for (const [key, entries] of Object.entries(incomeGroups)) {
      if (entries.length > 1) {
        // Keep the first one, delete the rest
        for (let i = 1; i < entries.length; i++) {
          await prisma.incomeEntry.delete({
            where: { id: entries[i].id }
          });
          incomeDeleted++;
          console.log(`❌ Deleted duplicate income: ${entries[i].amount} - ${entries[i].category}`);
        }
      }
    }
    
    // 2. Remove duplicate Expense Entries  
    console.log('\n💸 Cleaning Expense Entries...');
    const allExpenses = await prisma.expenseEntry.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    const expenseGroups = {};
    allExpenses.forEach(expense => {
      const key = `${expense.amount}-${expense.category}-${expense.note}-${expense.date}`;
      if (!expenseGroups[key]) {
        expenseGroups[key] = [];
      }
      expenseGroups[key].push(expense);
    });
    
    let expenseDeleted = 0;
    for (const [key, entries] of Object.entries(expenseGroups)) {
      if (entries.length > 1) {
        // Keep the first one, delete the rest
        for (let i = 1; i < entries.length; i++) {
          await prisma.expenseEntry.delete({
            where: { id: entries[i].id }
          });
          expenseDeleted++;
          console.log(`❌ Deleted duplicate expense: ${entries[i].amount} - ${entries[i].category}`);
        }
      }
    }
    
    // 3. Check and remove duplicate Invoices
    console.log('\n🧾 Checking Invoices...');
    const allInvoices = await prisma.invoice.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    const invoiceGroups = {};
    allInvoices.forEach(invoice => {
      const key = `${invoice.invoiceNumber}`;
      if (!invoiceGroups[key]) {
        invoiceGroups[key] = [];
      }
      invoiceGroups[key].push(invoice);
    });
    
    let invoiceDeleted = 0;
    for (const [key, entries] of Object.entries(invoiceGroups)) {
      if (entries.length > 1) {
        // Keep the first one, delete the rest
        for (let i = 1; i < entries.length; i++) {
          await prisma.invoice.delete({
            where: { id: entries[i].id }
          });
          invoiceDeleted++;
          console.log(`❌ Deleted duplicate invoice: ${entries[i].invoiceNumber}`);
        }
      }
    }
    
    // 4. Show final counts
    console.log('\n📊 Final Database State:');
    try {
      const finalIncome = await prisma.incomeEntry.count();
      console.log(`💰 Income Entries: ${finalIncome} (deleted ${incomeDeleted} duplicates)`);
    } catch (e) {
      console.log(`💰 Income Entries: deleted ${incomeDeleted} duplicates`);
    }
    
    try {
      const finalExpenses = await prisma.expenseEntry.count();
      console.log(`� Expense Entries: ${finalExpenses} (deleted ${expenseDeleted} duplicates)`);
    } catch (e) {
      console.log(`💸 Expense Entries: deleted ${expenseDeleted} duplicates`);
    }
    
    try {
      const finalInvoices = await prisma.invoice.count();
      console.log(`🧾 Invoices: ${finalInvoices} (deleted ${invoiceDeleted} duplicates)`);
    } catch (e) {
      console.log(`🧾 Invoices: deleted ${invoiceDeleted} duplicates`);
    }
    
    console.log('\n✅ Database cleanup completed successfully!');
    console.log(`🗑️ Total duplicates removed: ${incomeDeleted + expenseDeleted + invoiceDeleted}`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeDuplicates();
