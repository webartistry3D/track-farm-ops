const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkActualSchema() {
  try {
    console.log('🔍 Checking actual database schema...');
    
    // Check what we can actually query
    console.log('\n📋 USER Records (keechi@owner.com):');
    const user = await prisma.user.findUnique({
      where: { email: 'keechi@owner.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        invoices: {
          select: { id: true, invoiceNumber: true, total: true, status: true }
        },
        incomeEntries: {
          select: { id: true, amount: true, category: true, date: true }
        },
        expenseEntries: {
          select: { id: true, amount: true, category: true, date: true }
        },
        inventoryTransactions: {
          select: { id: true, itemName: true, quantity: true, type: true }
        },
        subscriptions: {
          select: { id: true, plan: true, status: true, price: true }
        }
      }
    });
    
    if (user) {
      console.log('✅ User found:', user.name);
      console.log('📧 Email:', user.email);
      console.log('🏢 Organization ID:', user.organizationId);
      
      console.log('\n🧾 Invoices:', user.invoices.length);
      user.invoices.forEach((inv, i) => {
        console.log(`   ${i+1}. ${inv.invoiceNumber} - $${inv.total} - ${inv.status}`);
      });
      
      console.log('\n💰 Income Entries:', user.incomeEntries.length);
      user.incomeEntries.forEach((inc, i) => {
        console.log(`   ${i+1}. $${inc.amount} - ${inc.category} - ${inc.date}`);
      });
      
      console.log('\n💸 Expense Entries:', user.expenseEntries.length);
      user.expenseEntries.forEach((exp, i) => {
        console.log(`   ${i+1}. $${exp.amount} - ${exp.category} - ${exp.date}`);
      });
      
      console.log('\n📦 Inventory Transactions:', user.inventoryTransactions.length);
      user.inventoryTransactions.forEach((inv, i) => {
        console.log(`   ${i+1}. ${inv.itemName} - ${inv.quantity} - ${inv.type}`);
      });
      
      console.log('\n🎫 Subscriptions:', user.subscriptions.length);
      user.subscriptions.forEach((sub, i) => {
        console.log(`   ${i+1}. ${sub.plan} - ${sub.status} - $${sub.price}`);
      });
    }
    
    // Check organization data
    console.log('\n🏢 ORGANIZATION Data:');
    const organization = await prisma.organization.findUnique({
      where: { id: 6 },
      select: {
        id: true,
        name: true,
        description: true,
        assets: {
          select: { id: true, name: true, category: true, cost: true, status: true }
        }
      }
    });
    
    if (organization) {
      console.log('✅ Organization:', organization.name);
      console.log('🔧 Assets:', organization.assets.length);
      organization.assets.forEach((asset, i) => {
        console.log(`   ${i+1}. ${asset.name} - ${asset.category} - $${asset.cost} - ${asset.status}`);
      });
    }
    
    // Check all invoices in the system
    console.log('\n🧾 ALL Invoices in System:');
    const allInvoices = await prisma.invoice.findMany({
      select: {
        id: true,
        invoiceNumber: true,
        total: true,
        status: true,
        userId: true,
        user: { select: { name: true, email: true } }
      },
      take: 10
    });
    
    console.log(`Total invoices: ${allInvoices.length}`);
    allInvoices.forEach((inv, i) => {
      console.log(`   ${i+1}. ${inv.invoiceNumber} - $${inv.total} - ${inv.user.name} (${inv.user.email})`);
    });
    
  } catch (error) {
    console.error('❌ Schema check error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkActualSchema();
