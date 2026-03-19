const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixCreatedBy() {
  try {
    console.log('🔧 FIXING CREATED BY FIELDS');
    console.log('==========================');

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

    console.log('\n🔧 FIXING INVOICES...');
    
    // Fix invoices
    const invoices = await prisma.invoice.findMany({
      select: {
        id: true,
        invoiceNumber: true,
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

    for (const invoice of invoices) {
      const correctCreatedBy = userToOwnerMap[invoice.userId];
      
      if (invoice.createdBy !== correctCreatedBy) {
        console.log(`  📝 Invoice ${invoice.invoiceNumber}: ${invoice.createdBy} -> ${correctCreatedBy}`);
        
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { createdBy: correctCreatedBy }
        });
      } else {
        console.log(`  ✅ Invoice ${invoice.invoiceNumber}: Already correct (${correctCreatedBy})`);
      }
    }

    console.log('\n💰 FIXING INCOME ENTRIES...');
    
    // Fix income entries
    const incomeEntries = await prisma.incomeEntry.findMany({
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

    for (const entry of incomeEntries) {
      const correctCreatedBy = userToOwnerMap[entry.userId];
      
      if (entry.createdBy !== correctCreatedBy) {
        console.log(`  📝 Income Entry ${entry.id}: ${entry.createdBy} -> ${correctCreatedBy}`);
        
        await prisma.incomeEntry.update({
          where: { id: entry.id },
          data: { createdBy: correctCreatedBy }
        });
      } else {
        console.log(`  ✅ Income Entry ${entry.id}: Already correct (${correctCreatedBy})`);
      }
    }

    console.log('\n💸 FIXING EXPENSE ENTRIES...');
    
    // Fix expense entries (note: expense entries might not have createdBy field yet)
    try {
      const expenseEntries = await prisma.expenseEntry.findMany({
        select: {
          id: true,
          amount: true,
          userId: true,
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

      for (const entry of expenseEntries) {
        const correctCreatedBy = userToOwnerMap[entry.userId];
        
        try {
          // Try to update if createdBy field exists
          await prisma.expenseEntry.update({
            where: { id: entry.id },
            data: { createdBy: correctCreatedBy }
          });
          console.log(`  📝 Expense Entry ${entry.id}: Set createdBy to ${correctCreatedBy}`);
        } catch (error) {
          console.log(`  ⚠️  Expense Entry ${entry.id}: createdBy field not available yet`);
        }
      }
    } catch (error) {
      console.log('  ⚠️  Expense entries table might not have createdBy field yet');
    }

    console.log('\n✅ FIX COMPLETE');
    console.log('================');
    
    // Verify the fixes
    console.log('\n🔍 VERIFYING FIXES...');
    
    const updatedInvoices = await prisma.invoice.findMany({
      select: {
        id: true,
        invoiceNumber: true,
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

    console.log('\n📄 UPDATED INVOICES:');
    updatedInvoices.forEach(invoice => {
      console.log(`  Invoice ${invoice.invoiceNumber}: User ${invoice.user?.name} -> createdBy: ${invoice.createdBy}`);
    });

    const updatedIncome = await prisma.incomeEntry.findMany({
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

    console.log('\n💰 UPDATED INCOME ENTRIES:');
    updatedIncome.forEach(entry => {
      console.log(`  Income Entry ${entry.id}: User ${entry.user?.name} -> createdBy: ${entry.createdBy}`);
    });

  } catch (error) {
    console.error('❌ Fix error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCreatedBy();
