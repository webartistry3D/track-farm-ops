const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupOrphanedIncomeRecords() {
  try {
    console.log('🔍 Starting cleanup of orphaned income records for kelechi@owner.com organization...');

    // Step 1: Find kelechi@owner.com user and organization
    console.log('\n📋 Step 1: Finding kelechi@owner.com user...');
    const kelechiUser = await prisma.user.findUnique({
      where: { email: 'kelechi@owner.com' },
      include: {
        organization: {
          select: { id: true, name: true }
        }
      }
    });

    if (!kelechiUser) {
      console.log('❌ User kelechi@owner.com not found');
      return;
    }

    if (!kelechiUser.organizationId) {
      console.log('❌ User kelechi@owner.com is not assigned to any organization');
      return;
    }

    console.log(`✅ Found user: ${kelechiUser.name} (${kelechiUser.email})`);
    console.log(`🏢 Organization: ${kelechiUser.organization?.name} (ID: ${kelechiUser.organizationId})`);

    // Step 2: Find all income records that reference paid invoices in the organization
    console.log('\n📋 Step 2: Finding income records that reference paid invoices...');
    const incomeRecordsWithInvoices = await prisma.incomeEntry.findMany({
      where: {
        organizationId: kelechiUser.organizationId,
        description: {
          contains: 'Payment for invoice #'
        }
      },
      select: {
        id: true,
        description: true,
        amount: true,
        date: true,
        userId: true,
        user: {
          select: { name: true, email: true }
        }
      }
    });

    console.log(`📊 Found ${incomeRecordsWithInvoices.length} income records that reference invoices`);

    // Extract invoice numbers from income descriptions
    const incomeInvoiceMap = new Map();
    incomeRecordsWithInvoices.forEach(income => {
      const match = income.description.match(/Payment for invoice #([^\s]+)/);
      if (match) {
        const invoiceNumber = match[1];
        incomeInvoiceMap.set(invoiceNumber, income);
      }
    });

    console.log(`📝 Extracted ${incomeInvoiceMap.size} unique invoice numbers from income records`);

    // Step 3: Find which paid invoices still exist
    console.log('\n📋 Step 3: Checking which invoices still exist...');
    const existingInvoices = await prisma.invoice.findMany({
      where: {
        user: {
          organizationId: kelechiUser.organizationId
        },
        invoiceNumber: {
          in: Array.from(incomeInvoiceMap.keys())
        },
        status: 'PAID'
      },
      select: {
        invoiceNumber: true,
        status: true,
        total: true,
        createdAt: true
      }
    });

    console.log(`✅ Found ${existingInvoices.length} paid invoices that still exist`);
    const existingInvoiceNumbers = new Set(existingInvoices.map(inv => inv.invoiceNumber));

    // Step 4: Find orphaned income records
    console.log('\n📋 Step 4: Identifying orphaned income records...');
    const orphanedIncomes = [];
    
    for (const [invoiceNumber, incomeRecord] of incomeInvoiceMap) {
      if (!existingInvoiceNumbers.has(invoiceNumber)) {
        orphanedIncomes.push(incomeRecord);
        console.log(`🔍 Orphaned income found: ID ${incomeRecord.id}, Invoice #${invoiceNumber}, Amount ₦${incomeRecord.amount}, User: ${incomeRecord.user?.name}`);
      }
    }

    console.log(`\n🎯 SUMMARY:`);
    console.log(`- Total income records with invoices: ${incomeRecordsWithInvoices.length}`);
    console.log(`- Paid invoices that still exist: ${existingInvoices.length}`);
    console.log(`- Orphaned income records to delete: ${orphanedIncomes.length}`);

    if (orphanedIncomes.length === 0) {
      console.log('\n✅ No orphaned income records found. Cleanup complete!');
      return;
    }

    // Step 5: Delete the orphaned income records
    console.log('\n📋 Step 5: Deleting orphaned income records...');
    
    const orphanedIds = orphanedIncomes.map(income => income.id);
    
    console.log(`🗑️ About to delete income records with IDs: ${orphanedIds.join(', ')}`);
    
    // Confirm deletion
    const totalAmount = orphanedIncomes.reduce((sum, income) => sum + income.amount, 0);
    console.log(`💰 Total amount to be removed: ₦${totalAmount.toLocaleString()}`);
    
    // Delete orphaned records
    const deleteResult = await prisma.incomeEntry.deleteMany({
      where: {
        id: {
          in: orphanedIds
        }
      }
    });

    console.log(`✅ Successfully deleted ${deleteResult.count} orphaned income records`);
    
    // Final verification
    const remainingOrphaned = await prisma.incomeEntry.count({
      where: {
        organizationId: kelechiUser.organizationId,
        description: {
          contains: 'Payment for invoice #'
        },
        id: {
          in: orphanedIds
        }
      }
    });

    if (remainingOrphaned === 0) {
      console.log('✅ Verification successful: All orphaned records have been deleted');
    } else {
      console.log(`⚠️ Warning: ${remainingOrphaned} orphaned records still remain`);
    }

    console.log('\n🎉 Cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupOrphanedIncomeRecords();
