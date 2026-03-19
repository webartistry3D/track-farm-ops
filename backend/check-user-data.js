const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserData() {
  try {
    console.log('📊 Checking all data for keechi@owner.com (ID: 4)...');
    
    const userId = 4;
    const organizationId = 6;
    
    // Check what models exist
    console.log('\n🔍 Checking available models...');
    
    const results = {};
    
    // Check subscriptions
    try {
      results.subscriptions = await prisma.subscription.findMany({
        where: { userId },
        select: { id: true, plan: true, status: true, price: true, createdAt: true }
      });
      console.log('✅ Subscriptions model available');
    } catch (error) {
      console.log('❌ Subscriptions model not available');
      results.subscriptions = [];
    }
    
    // Check invoices
    try {
      results.invoices = await prisma.invoice.findMany({
        where: { userId },
        select: { id: true, invoiceNumber: true, status: true, amount: true, createdAt: true }
      });
      console.log('✅ Invoices model available');
    } catch (error) {
      console.log('❌ Invoices model not available');
      results.invoices = [];
    }
    
    // Check income
    try {
      results.income = await prisma.income.findMany({
        where: { userId },
        select: { id: true, amount: true, category: true, date: true, description: true }
      });
      console.log('✅ Income model available');
    } catch (error) {
      console.log('❌ Income model not available');
      results.income = [];
    }
    
    // Check expenses
    try {
      results.expenses = await prisma.expense.findMany({
        where: { userId },
        select: { id: true, amount: true, category: true, date: true, description: true }
      });
      console.log('✅ Expenses model available');
    } catch (error) {
      console.log('❌ Expenses model not available');
      results.expenses = [];
    }
    
    // Check inventory
    try {
      results.inventory = await prisma.inventory.findMany({
        where: { organizationId },
        select: { id: true, name: true, quantity: true, category: true, status: true }
      });
      console.log('✅ Inventory model available');
    } catch (error) {
      console.log('❌ Inventory model not available');
      results.inventory = [];
    }
    
    // Check assets
    try {
      results.assets = await prisma.asset.findMany({
        where: { organizationId },
        select: { id: true, name: true, type: true, value: true, status: true }
      });
      console.log('✅ Assets model available');
    } catch (error) {
      console.log('❌ Assets model not available');
      results.assets = [];
    }
    
    // Check organization
    try {
      results.organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { id: true, name: true, description: true }
      });
      console.log('✅ Organization model available');
    } catch (error) {
      console.log('❌ Organization model not available');
      results.organization = null;
    }
    
    // Display results
    console.log('\n🏢 Organization:', results.organization);
    
    console.log('\n🎫 Subscriptions:', results.subscriptions.length);
    results.subscriptions.forEach((sub, i) => {
      console.log(`   ${i+1}. ${sub.plan} - ${sub.status} - $${sub.price}`);
    });
    
    console.log('\n🧾 Invoices:', results.invoices.length);
    results.invoices.forEach((inv, i) => {
      console.log(`   ${i+1}. ${inv.invoiceNumber} - ${inv.status} - $${inv.amount}`);
    });
    
    console.log('\n💰 Income Records:', results.income.length);
    results.income.forEach((inc, i) => {
      console.log(`   ${i+1}. $${inc.amount} - ${inc.category} - ${inc.date}`);
    });
    
    console.log('\n💸 Expense Records:', results.expenses.length);
    results.expenses.forEach((exp, i) => {
      console.log(`   ${i+1}. $${exp.amount} - ${exp.category} - ${exp.date}`);
    });
    
    console.log('\n📦 Inventory Items:', results.inventory.length);
    results.inventory.forEach((item, i) => {
      console.log(`   ${i+1}. ${item.name} - ${item.quantity} - ${item.status}`);
    });
    
    console.log('\n🔧 Assets:', results.assets.length);
    results.assets.forEach((asset, i) => {
      console.log(`   ${i+1}. ${asset.name} - ${asset.type} - $${asset.value}`);
    });
    
    console.log('\n📈 Summary:');
    console.log(`   Total subscriptions: ${results.subscriptions.length}`);
    console.log(`   Total invoices: ${results.invoices.length}`);
    console.log(`   Total income records: ${results.income.length}`);
    console.log(`   Total expense records: ${results.expenses.length}`);
    console.log(`   Total inventory items: ${results.inventory.length}`);
    console.log(`   Total assets: ${results.assets.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserData();
