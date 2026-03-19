const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseForFarmOps() {
  try {
    console.log('🔍 Checking database for "farm-ops" occurrences...\n');

    // Check users table
    console.log('📋 Checking users table...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    const usersWithFarmOps = users.filter(user => 
      user.name?.includes('farm-ops') || 
      user.email?.includes('farm-ops') ||
      user.role?.includes('farm-ops')
    );
    
    console.log(`   Found ${usersWithFarmOps.length} users with "farm-ops" references`);
    usersWithFarmOps.forEach(user => {
      console.log(`   - User ID ${user.id}: ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // Check organizations table
    console.log('\n🏢 Checking organizations table...');
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        description: true
      }
    });
    
    const orgsWithFarmOps = organizations.filter(org => 
      org.name?.includes('farm-ops') || 
      org.description?.includes('farm-ops')
    );
    
    console.log(`   Found ${orgsWithFarmOps.length} organizations with "farm-ops" references`);
    orgsWithFarmOps.forEach(org => {
      console.log(`   - Org ID ${org.id}: ${org.name}`);
      if (org.description) {
        console.log(`     Description: ${org.description.substring(0, 100)}...`);
      }
    });

    // Check income entries for category or description
    console.log('\n💰 Checking income entries...');
    const incomeEntries = await prisma.incomeEntry.findMany({
      select: {
        id: true,
        category: true,
        description: true
      },
      take: 100 // Limit to avoid too much data
    });
    
    const incomeWithFarmOps = incomeEntries.filter(entry => 
      entry.category?.includes('farm-ops') || 
      entry.description?.includes('farm-ops')
    );
    
    console.log(`   Found ${incomeWithFarmOps.length} income entries with "farm-ops" references (sample of 100)`);
    incomeWithFarmOps.forEach(entry => {
      console.log(`   - Income ID ${entry.id}: Category: ${entry.category}`);
      if (entry.description) {
        console.log(`     Description: ${entry.description.substring(0, 100)}...`);
      }
    });

    // Check expense entries for category or notes
    console.log('\n💸 Checking expense entries...');
    const expenseEntries = await prisma.expenseEntry.findMany({
      select: {
        id: true,
        category: true,
        note: true,
        merchant: true
      },
      take: 100 // Limit to avoid too much data
    });
    
    const expensesWithFarmOps = expenseEntries.filter(entry => 
      entry.category?.includes('farm-ops') || 
      entry.note?.includes('farm-ops') ||
      entry.merchant?.includes('farm-ops')
    );
    
    console.log(`   Found ${expensesWithFarmOps.length} expense entries with "farm-ops" references (sample of 100)`);
    expensesWithFarmOps.forEach(entry => {
      console.log(`   - Expense ID ${entry.id}: Category: ${entry.category}, Merchant: ${entry.merchant}`);
      if (entry.note) {
        console.log(`     Note: ${entry.note.substring(0, 100)}...`);
      }
    });

    // Check inventory items
    console.log('\n📦 Checking inventory items...');
    const inventoryItems = await prisma.inventoryItem.findMany({
      select: {
        id: true,
        name: true,
        description: true
      },
      take: 100
    });
    
    const itemsWithFarmOps = inventoryItems.filter(item => 
      item.name?.includes('farm-ops') || 
      item.description?.includes('farm-ops')
    );
    
    console.log(`   Found ${itemsWithFarmOps.length} inventory items with "farm-ops" references (sample of 100)`);
    itemsWithFarmOps.forEach(item => {
      console.log(`   - Item ID ${item.id}: ${item.name}`);
      if (item.description) {
        console.log(`     Description: ${item.description.substring(0, 100)}...`);
      }
    });

    // Check assets
    console.log('\n🚜 Checking assets...');
    const assets = await prisma.asset.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        supplier: true
      },
      take: 100
    });
    
    const assetsWithFarmOps = assets.filter(asset => 
      asset.name?.includes('farm-ops') || 
      asset.description?.includes('farm-ops') ||
      asset.supplier?.includes('farm-ops')
    );
    
    console.log(`   Found ${assetsWithFarmOps.length} assets with "farm-ops" references (sample of 100)`);
    assetsWithFarmOps.forEach(asset => {
      console.log(`   - Asset ID ${asset.id}: ${asset.name}, Supplier: ${asset.supplier}`);
      if (asset.description) {
        console.log(`     Description: ${asset.description.substring(0, 100)}...`);
      }
    });

    console.log('\n✅ Database scan completed!');
    
    // Summary
    const totalFound = usersWithFarmOps.length + orgsWithFarmOps.length + 
                     incomeWithFarmOps.length + expensesWithFarmOps.length + 
                     itemsWithFarmOps.length + assetsWithFarmOps.length;
    
    if (totalFound === 0) {
      console.log('🎉 No "farm-ops" references found in database records!');
    } else {
      console.log(`⚠️  Found ${totalFound} total records with "farm-ops" references that may need updating.`);
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseForFarmOps();
