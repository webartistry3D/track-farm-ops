const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const devPrisma = new PrismaClient();

async function exportDevData() {
  try {
    console.log('📤 Exporting development data...\n');
    
    const data = {
      organizations: await devPrisma.organization.findMany(),
      inventoryCategories: await devPrisma.inventoryCategory.findMany(),
      inventoryItems: await devPrisma.inventoryItem.findMany(),
      incomeEntries: await devPrisma.incomeEntry.findMany(),
      expenseEntries: await devPrisma.expenseEntry.findMany(),
      assets: await devPrisma.asset.findMany(),
      invoices: await devPrisma.invoice.findMany(),
      users: await devPrisma.user.findMany()
    };
    
    // Save to JSON file
    fs.writeFileSync('dev-data-export.json', JSON.stringify(data, null, 2));
    
    console.log('✅ Development data exported successfully!');
    console.log(`📊 Organizations: ${data.organizations.length}`);
    console.log(`📂 Categories: ${data.inventoryCategories.length}`);
    console.log(`📦 Inventory Items: ${data.inventoryItems.length}`);
    console.log(`💰 Income Entries: ${data.incomeEntries.length}`);
    console.log(`💸 Expense Entries: ${data.expenseEntries.length}`);
    console.log(`🚜 Assets: ${data.assets.length}`);
    console.log(`🧾 Invoices: ${data.invoices.length}`);
    console.log(`👥 Users: ${data.users.length}`);
    console.log('\n💾 Data saved to: dev-data-export.json');
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    await devPrisma.$disconnect();
  }
}

exportDevData();
