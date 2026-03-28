const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkExistingVAT() {
  console.log('🔍 Checking for existing VAT data in database...');

  try {
    // Check ALL fields in incomeEntry table to see what VAT data exists
    const allEntries = await prisma.incomeEntry.findMany({
      select: {
        id: true,
        amount: true,
        description: true,
        date: true,
        // Check ALL valid VAT fields
        enableVAT: true,
        vatRate: true,
        vatAmount: true,
        subtotal: true,
        category: true,
        paymentMethod: true,
        createdAt: true,
        userId: true,
        organizationId: true
      }
    });

    console.log(`📊 Total entries found: ${allEntries.length}`);

    if (allEntries.length === 0) {
      console.log('❌ No income entries found in database');
      return;
    }

    // Show detailed breakdown of each entry
    allEntries.forEach((entry, index) => {
      console.log(`\n📋 Entry ${index + 1} (ID: ${entry.id}):`);
      console.log(`  Amount: ₦${entry.amount?.toLocaleString() || 'N/A'}`);
      console.log(`  Description: ${entry.description || 'No description'}`);
      console.log(`  Date: ${entry.date || 'No date'}`);
      console.log(`  VAT Fields:`);
      console.log(`    enableVAT: ${entry.enableVAT}`);
      console.log(`    vatRate: ${entry.vatRate}%`);
      console.log(`    vatAmount: ₦${entry.vatAmount?.toLocaleString() || 'N/A'}`);
      console.log(`    subtotal: ₦${entry.subtotal?.toLocaleString() || 'N/A'}`);
      console.log(`    tax: N/A (field doesn't exist)`);
      console.log(`    taxRate: N/A (field doesn't exist)`);
      console.log(`    taxAmount: N/A (field doesn't exist)`);
    });

    // Check specifically for entries with actual VAT amounts
    const entriesWithVAT = allEntries.filter(entry => 
      entry.vatAmount && entry.vatAmount > 0
    );

    console.log(`\n💰 Entries with VAT amounts: ${entriesWithVAT.length}`);
    
    if (entriesWithVAT.length > 0) {
      console.log('\n🎯 VAT Records that should appear:');
      entriesWithVAT.forEach(entry => {
        console.log(`  Entry ${entry.id}: ₦${entry.vatAmount.toLocaleString()} VAT from ₦${entry.amount.toLocaleString()} income`);
      });
    } else {
      console.log('\n❌ NO entries found with VAT amounts > 0');
      console.log('   This explains why VAT Records shows empty!');
    }

  } catch (error) {
    console.error('❌ Error checking VAT data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkExistingVAT()
  .then(() => {
    console.log('\n🎉 VAT data check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ VAT data check failed:', error);
    process.exit(1);
  });
