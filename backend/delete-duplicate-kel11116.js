const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteDuplicateIncomeForKEL11116() {
  try {
    console.log('🔍 Looking for duplicate income records for invoice #KEL-11116...');

    // Step 1: Find all income records referencing KEL-11116
    console.log('\n📋 Step 1: Finding income records for invoice #KEL-11116...');
    const incomeRecords = await prisma.incomeEntry.findMany({
      where: {
        description: {
          contains: 'Payment for invoice #KEL-11116'
        }
      },
      select: {
        id: true,
        description: true,
        amount: true,
        date: true,
        userId: true,
        createdAt: true,
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: {
        createdAt: 'asc' // Show oldest first
      }
    });

    console.log(`📊 Found ${incomeRecords.length} income records for invoice #KEL-11116:`);
    incomeRecords.forEach((income, index) => {
      console.log(`  ${index + 1}. ID: ${income.id}, Amount: ₦${income.amount}, Date: ${income.date}, Created: ${income.createdAt}, User: ${income.user?.name}`);
    });

    if (incomeRecords.length <= 1) {
      console.log('✅ No duplicate income records found for invoice #KEL-11116');
      return;
    }

    // Step 2: Check if invoice #KEL-11116 exists
    console.log('\n📋 Step 2: Verifying invoice #KEL-11116 exists...');
    const invoice = await prisma.invoice.findUnique({
      where: { invoiceNumber: 'KEL-11116' },
      select: {
        id: true,
        invoiceNumber: true,
        total: true,
        status: true,
        createdAt: true,
        userId: true
      }
    });

    if (!invoice) {
      console.log('⚠️ Invoice #KEL-11116 not found in invoice records');
    } else {
      console.log(`✅ Found invoice #KEL-11116: Total ₦${invoice.total}, Status: ${invoice.status}, Created: ${invoice.createdAt}`);
    }

    // Step 3: Identify which income record to keep (the most recent one)
    console.log('\n📋 Step 3: Determining which record to keep...');
    
    // Sort by creation date, keep the most recent one
    const sortedRecords = [...incomeRecords].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const recordToKeep = sortedRecords[0];
    const recordsToDelete = sortedRecords.slice(1);

    console.log(`📌 Record to keep: ID ${recordToKeep.id} (created ${recordToKeep.createdAt})`);
    console.log(`🗑️ Records to delete: ${recordsToDelete.map(r => r.id).join(', ')}`);

    // Step 4: Delete the duplicate records
    console.log('\n📋 Step 4: Deleting duplicate income records...');
    
    const deleteIds = recordsToDelete.map(r => r.id);
    const totalAmountToDelete = recordsToDelete.reduce((sum, r) => sum + r.amount, 0);
    
    console.log(`💰 Total amount to be removed: ₦${totalAmountToDelete.toLocaleString()}`);
    
    const deleteResult = await prisma.incomeEntry.deleteMany({
      where: {
        id: {
          in: deleteIds
        }
      }
    });

    console.log(`✅ Successfully deleted ${deleteResult.count} duplicate income records`);

    // Step 5: Verification
    console.log('\n📋 Step 5: Verification...');
    const remainingRecords = await prisma.incomeEntry.count({
      where: {
        description: {
          contains: 'Payment for invoice #KEL-11116'
        }
      }
    });

    if (remainingRecords === 1) {
      console.log('✅ Verification successful: Only 1 income record remains for invoice #KEL-11116');
      
      // Show the remaining record
      const remainingRecord = await prisma.incomeEntry.findFirst({
        where: {
          description: {
            contains: 'Payment for invoice #KEL-11116'
          }
        },
        select: {
          id: true,
          description: true,
          amount: true,
          date: true,
          createdAt: true,
          user: {
            select: { name: true, email: true }
          }
        }
      });
      
      console.log(`📌 Remaining record: ID ${remainingRecord.id}, Amount: ₦${remainingRecord.amount}, User: ${remainingRecord.user?.name}`);
    } else {
      console.log(`⚠️ Warning: Expected 1 remaining record, found ${remainingRecords}`);
    }

    console.log('\n🎉 Duplicate cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
deleteDuplicateIncomeForKEL11116();
