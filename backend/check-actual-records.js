const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkActualRecords() {
  try {
    console.log('🔍 Checking actual records for keechi@owner.com...');
    
    // Get user with all their related data
    const user = await prisma.user.findUnique({
      where: { email: 'keechi@owner.com' },
      include: {
        organization: true,
        subscriptions: {
          select: { id: true, plan: true, status: true, price: true, createdAt: true }
        },
        invoices: {
          select: { 
            id: true, 
            invoiceNumber: true, 
            total: true, 
            status: true, 
            createdAt: true,
            clientName: true
          }
        },
        incomeEntries: {
          select: { id: true, amount: true, category: true, date: true, description: true }
        },
        expenseEntries: {
          select: { id: true, amount: true, category: true, date: true, description: true }
        },
        inventoryTransactions: {
          select: { 
            id: true, 
            quantityChange: true, 
            reason: true, 
            date: true,
            inventoryItem: {
              select: { name: true, category: true }
            }
          }
        }
      }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('\n👤 USER INFO:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Created: ${user.createdAt}`);
    
    console.log('\n🏢 ORGANIZATION:');
    if (user.organization) {
      console.log(`   Name: ${user.organization.name}`);
      console.log(`   Description: ${user.organization.description || 'None'}`);
    }
    
    console.log('\n🎫 SUBSCRIPTIONS:');
    console.log(`   Count: ${user.subscriptions.length}`);
    user.subscriptions.forEach((sub, i) => {
      console.log(`   ${i+1}. ${sub.plan} - ${sub.status} - $${sub.price} - ${sub.createdAt}`);
    });
    
    console.log('\n🧾 INVOICES:');
    console.log(`   Count: ${user.invoices.length}`);
    user.invoices.forEach((inv, i) => {
      console.log(`   ${i+1}. ${inv.invoiceNumber} - $${inv.total} - ${inv.status} - ${inv.clientName || 'No client'} - ${inv.createdAt}`);
    });
    
    console.log('\n💰 INCOME ENTRIES:');
    console.log(`   Count: ${user.incomeEntries.length}`);
    user.incomeEntries.forEach((inc, i) => {
      console.log(`   ${i+1}. $${inc.amount} - ${inc.category} - ${inc.date} - ${inc.description || 'No description'}`);
    });
    
    console.log('\n💸 EXPENSE ENTRIES:');
    console.log(`   Count: ${user.expenseEntries.length}`);
    user.expenseEntries.forEach((exp, i) => {
      console.log(`   ${i+1}. $${exp.amount} - ${exp.category} - ${exp.date} - ${exp.description || 'No description'}`);
    });
    
    console.log('\n📦 INVENTORY TRANSACTIONS:');
    console.log(`   Count: ${user.inventoryTransactions.length}`);
    user.inventoryTransactions.forEach((trans, i) => {
      const itemName = trans.inventoryItem?.name || 'Unknown item';
      console.log(`   ${i+1}. ${itemName} - Qty change: ${trans.quantityChange} - ${trans.reason} - ${trans.date}`);
    });
    
    // Check organization assets
    if (user.organization) {
      const assets = await prisma.asset.findMany({
        where: { organizationId: user.organizationId },
        select: {
          id: true,
          name: true,
          category: true,
          cost: true,
          status: true,
          purchaseDate: true
        }
      });
      
      console.log('\n🔧 ORGANIZATION ASSETS:');
      console.log(`   Count: ${assets.length}`);
      assets.forEach((asset, i) => {
        console.log(`   ${i+1}. ${asset.name} - ${asset.category} - $${asset.cost} - ${asset.status} - ${asset.purchaseDate}`);
      });
    }
    
    // Summary
    const totalRecords = user.subscriptions.length + user.invoices.length + 
                        user.incomeEntries.length + user.expenseEntries.length + 
                        user.inventoryTransactions.length;
    
    console.log('\n📊 SUMMARY:');
    console.log(`   Total records found: ${totalRecords}`);
    console.log(`   Subscriptions: ${user.subscriptions.length}`);
    console.log(`   Invoices: ${user.invoices.length}`);
    console.log(`   Income entries: ${user.incomeEntries.length}`);
    console.log(`   Expense entries: ${user.expenseEntries.length}`);
    console.log(`   Inventory transactions: ${user.inventoryTransactions.length}`);
    
    if (totalRecords === 3) { // Only subscriptions exist
      console.log('\n⚠️  WARNING: Only subscription data exists. Other business records may have been lost during database changes.');
    }
    
  } catch (error) {
    console.error('❌ Error checking records:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkActualRecords();
