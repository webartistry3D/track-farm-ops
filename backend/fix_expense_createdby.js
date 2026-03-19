const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixExpenseCreatedBy() {
  try {
    console.log('🔧 FIXING EXPENSE ENTRIES CREATED BY');
    console.log('===================================');

    // Get all users to map owner relationships
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdBy: true
      }
    });

    console.log('\n📋 USER MAPPING:');
    users.forEach(user => {
      console.log(`  ${user.role} ${user.name} (ID: ${user.id}) -> createdBy: ${user.createdBy}`);
    });

    // Create a map of user -> owner
    const userToOwnerMap = {};
    users.forEach(user => {
      if (user.createdBy) {
        userToOwnerMap[user.id] = user.createdBy;
      } else if (user.role === 'OWNER') {
        userToOwnerMap[user.id] = null; // Owners have no creator
      }
    });

    console.log('\n💸 FIXING EXPENSE ENTRIES...');
    
    // Get all expense entries
    const expenseEntries = await prisma.expenseEntry.findMany({
      select: {
        id: true,
        amount: true,
        userId: true,
        createdBy: true,
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            createdBy: true
          }
        }
      }
    });

    console.log(`Found ${expenseEntries.length} expense entries`);

    for (const entry of expenseEntries) {
      const correctCreatedBy = userToOwnerMap[entry.userId];
      
      if (entry.createdBy !== correctCreatedBy) {
        console.log(`  📝 Expense Entry ${entry.id}: ${entry.createdBy} -> ${correctCreatedBy} (User: ${entry.user?.name})`);
        
        await prisma.expenseEntry.update({
          where: { id: entry.id },
          data: { createdBy: correctCreatedBy }
        });
      } else {
        console.log(`  ✅ Expense Entry ${entry.id}: Already correct (${correctCreatedBy}) (User: ${entry.user?.name})`);
      }
    }

    console.log('\n✅ FIX COMPLETE');
    console.log('================');
    
    // Verify the fixes
    console.log('\n🔍 VERIFYING FIXES...');
    
    const updatedExpenses = await prisma.expenseEntry.findMany({
      select: {
        id: true,
        amount: true,
        userId: true,
        createdBy: true,
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            createdBy: true
          }
        }
      }
    });

    console.log('\n💸 UPDATED EXPENSE ENTRIES:');
    updatedExpenses.forEach(entry => {
      console.log(`  Expense Entry ${entry.id}: User ${entry.user?.name} -> createdBy: ${entry.createdBy}`);
    });

  } catch (error) {
    console.error('❌ Fix error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixExpenseCreatedBy();
