const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simpleRecordCheck() {
  try {
    console.log('🔍 Simple record check for keechi@owner.com...');
    
    // Get basic user info
    const user = await prisma.user.findUnique({
      where: { email: 'keechi@owner.com' },
      select: { id: true, name: true, email: true, role: true, organizationId: true }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('\n👤 USER INFO:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Organization ID: ${user.organizationId}`);
    
    // Check each record type separately
    console.log('\n🎫 SUBSCRIPTIONS:');
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: user.id },
      select: { id: true, plan: true, status: true, price: true, createdAt: true }
    });
    console.log(`   Count: ${subscriptions.length}`);
    subscriptions.forEach((sub, i) => {
      console.log(`   ${i+1}. ${sub.plan} - ${sub.status} - $${sub.price}`);
    });
    
    console.log('\n🧾 INVOICES:');
    try {
      const invoices = await prisma.invoice.findMany({
        where: { userId: user.id },
        select: { id: true, invoiceNumber: true, total: true, status: true, createdAt: true },
        take: 10
      });
      console.log(`   Count: ${invoices.length}`);
      invoices.forEach((inv, i) => {
        console.log(`   ${i+1}. ${inv.invoiceNumber} - $${inv.total} - ${inv.status}`);
      });
    } catch (error) {
      console.log('   ❌ Invoices not accessible:', error.message);
    }
    
    console.log('\n💰 INCOME:');
    try {
      const income = await prisma.incomeEntry.findMany({
        where: { userId: user.id },
        select: { id: true, amount: true, category: true, date: true },
        take: 10
      });
      console.log(`   Count: ${income.length}`);
      income.forEach((inc, i) => {
        console.log(`   ${i+1}. $${inc.amount} - ${inc.category} - ${inc.date}`);
      });
    } catch (error) {
      console.log('   ❌ Income not accessible:', error.message);
    }
    
    console.log('\n💸 EXPENSES:');
    try {
      const expenses = await prisma.expenseEntry.findMany({
        where: { userId: user.id },
        select: { id: true, amount: true, category: true, date: true },
        take: 10
      });
      console.log(`   Count: ${expenses.length}`);
      expenses.forEach((exp, i) => {
        console.log(`   ${i+1}. $${exp.amount} - ${exp.category} - ${exp.date}`);
      });
    } catch (error) {
      console.log('   ❌ Expenses not accessible:', error.message);
    }
    
    console.log('\n📦 INVENTORY TRANSACTIONS:');
    try {
      const inventory = await prisma.inventoryTransaction.findMany({
        where: { userId: user.id },
        select: { id: true, quantityChange: true, reason: true, date: true },
        take: 10
      });
      console.log(`   Count: ${inventory.length}`);
      inventory.forEach((inv, i) => {
        console.log(`   ${i+1}. Qty change: ${inv.quantityChange} - ${inv.reason} - ${inv.date}`);
      });
    } catch (error) {
      console.log('   ❌ Inventory transactions not accessible:', error.message);
    }
    
    console.log('\n🔧 ASSETS:');
    try {
      const assets = await prisma.asset.findMany({
        where: { organizationId: user.organizationId },
        select: { id: true, name: true, category: true, cost: true, status: true },
        take: 10
      });
      console.log(`   Count: ${assets.length}`);
      assets.forEach((asset, i) => {
        console.log(`   ${i+1}. ${asset.name} - ${asset.category} - $${asset.cost} - ${asset.status}`);
      });
    } catch (error) {
      console.log('   ❌ Assets not accessible:', error.message);
    }
    
    // Check if there are ANY records in these tables (not just for this user)
    console.log('\n🔍 CHECKING FOR ANY RECORDS IN SYSTEM:');
    
    const checks = [
      { name: 'Invoices', model: 'invoice' },
      { name: 'Income', model: 'incomeEntry' },
      { name: 'Expenses', model: 'expenseEntry' },
      { name: 'Inventory', model: 'inventoryTransaction' },
      { name: 'Assets', model: 'asset' }
    ];
    
    for (const check of checks) {
      try {
        const count = await prisma[check.model].count();
        console.log(`   ${check.name}: ${count} total records in system`);
      } catch (error) {
        console.log(`   ${check.name}: Not accessible`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

simpleRecordCheck();
