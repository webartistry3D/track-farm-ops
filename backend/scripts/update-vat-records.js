const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateVATRecords() {
  console.log('🔄 Starting VAT records update...');

  try {
    // Show ALL income entries to understand current VAT data
    const allEntries = await prisma.incomeEntry.findMany({
      where: {
        amount: {
          gt: 0
        }
      },
      select: {
        id: true,
        amount: true,
        enableVAT: true,
        vatRate: true,
        vatAmount: true,
        subtotal: true,
        description: true,
        date: true
      }
    });

    console.log(`📊 ALL income entries in database (${allEntries.length}):`);
    allEntries.forEach(entry => {
      console.log(`  Entry ${entry.id}: Amount=${entry.amount}, VAT=${entry.vatAmount}, EnableVAT=${entry.enableVAT}, Rate=${entry.vatRate}`);
    });

    // Find entries that have VAT amounts but enableVAT might be false/null
    const entriesToUpdate = await prisma.incomeEntry.findMany({
      where: {
        OR: [
          { 
            AND: [
              { vatAmount: { not: null } },
              { vatAmount: { gt: 0 } },
              { enableVAT: false }
            ]
          },
          { 
            AND: [
              { vatAmount: { not: null } },
              { vatAmount: { gt: 0 } },
              { enableVAT: null }
            ]
          }
        ]
      }
    });

    console.log(`📊 Found ${entriesToUpdate.length} entries with VAT data that need enableVAT=true`);

    // Update entries to ensure enableVAT is true when VAT data exists
    for (const entry of entriesToUpdate) {
      await prisma.incomeEntry.update({
        where: { id: entry.id },
        data: {
          enableVAT: true
          // Keep existing VAT amounts - don't recalculate
        }
      });

      console.log(`✅ Updated entry ${entry.id}: Amount=${entry.amount}, VAT=${entry.vatAmount}, Set enableVAT=true`);
    }

    console.log(`✅ Successfully updated ${entriesToUpdate.length} VAT records`);
  } catch (error) {
    console.error('❌ Error updating VAT records:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateVATRecords()
  .then(() => {
    console.log('🎉 VAT records update completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ VAT records update failed:', error);
    process.exit(1);
  });
