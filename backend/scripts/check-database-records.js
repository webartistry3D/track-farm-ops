const { PrismaClient } = require('@prisma/client');

async function checkDatabaseRecords() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking production database records...\n');
    
    // Check users
    console.log('👤 USERS:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        createdAt: true
      }
    });
    console.log(`Total users: ${users.length}`);
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}, Org: ${user.organizationId}`);
    });
    
    // Check organizations
    console.log('\n🏢 ORGANIZATIONS:');
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    });
    console.log(`Total organizations: ${organizations.length}`);
    organizations.forEach(org => {
      console.log(`- ID: ${org.id}, Name: ${org.name}, Created: ${org.createdAt}`);
    });
    
    // Check inventory items
    console.log('\n📦 INVENTORY ITEMS:');
    const inventoryItems = await prisma.inventoryItem.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        quantity: true,
        organizationId: true,
        createdAt: true
      },
      take: 10 // Limit to first 10 for readability
    });
    console.log(`Total inventory items (showing first 10): ${inventoryItems.length}`);
    inventoryItems.forEach(item => {
      console.log(`- ID: ${item.id}, Name: ${item.name}, Type: ${item.type}, Quantity: ${item.quantity}, Org: ${item.organizationId}`);
    });
    
    // Check income entries
    console.log('\n💰 INCOME ENTRIES:');
    const incomeEntries = await prisma.incomeEntry.findMany({
      select: {
        id: true,
        amount: true,
        category: true,
        organizationId: true,
        createdAt: true
      },
      take: 5 // Limit to first 5
    });
    console.log(`Total income entries (showing first 5): ${incomeEntries.length}`);
    incomeEntries.forEach(income => {
      console.log(`- ID: ${income.id}, Amount: ${income.amount}, Category: ${income.category}, Org: ${income.organizationId}`);
    });
    
    // Check expense entries
    console.log('\n💸 EXPENSE ENTRIES:');
    const expenseEntries = await prisma.expenseEntry.findMany({
      select: {
        id: true,
        amount: true,
        category: true,
        organizationId: true,
        createdAt: true
      },
      take: 5 // Limit to first 5
    });
    console.log(`Total expense entries (showing first 5): ${expenseEntries.length}`);
    expenseEntries.forEach(expense => {
      console.log(`- ID: ${expense.id}, Amount: ${expense.amount}, Category: ${expense.category}, Org: ${expense.organizationId}`);
    });
    
    // Check invoices
    console.log('\n🧾 INVOICES:');
    const invoices = await prisma.invoice.findMany({
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        total: true,
        createdAt: true,
        user: {
          select: {
            organizationId: true
          }
        }
      },
      take: 5 // Limit to first 5
    });
    console.log(`Total invoices (showing first 5): ${invoices.length}`);
    invoices.forEach(invoice => {
      console.log(`- ID: ${invoice.id}, Number: ${invoice.invoiceNumber}, Status: ${invoice.status}, Total: ${invoice.total}, Org: ${invoice.user.organizationId}`);
    });
    
    // Check assets
    console.log('\n🚜 ASSETS:');
    const assets = await prisma.asset.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        status: true,
        organizationId: true,
        createdAt: true
      },
      take: 5 // Limit to first 5
    });
    console.log(`Total assets (showing first 5): ${assets.length}`);
    assets.forEach(asset => {
      console.log(`- ID: ${asset.id}, Name: ${asset.name}, Category: ${asset.category}, Status: ${asset.status}, Org: ${asset.organizationId}`);
    });
    
    console.log('\n✅ Database records check completed successfully!');
    
  } catch (error) {
    console.error('❌ Error checking database records:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseRecords();
