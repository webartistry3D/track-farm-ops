const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixVatAmounts() {
  console.log('🔧 Starting VAT amount fix script...');
  
  try {
    // Find all income entries with VAT enabled but vatAmount = 0
    const entriesToUpdate = await prisma.incomeEntry.findMany({
      where: {
        enableVAT: true,
        vatAmount: 0
      }
    });

    console.log(`📊 Found ${entriesToUpdate.length} entries to update`);

    if (entriesToUpdate.length === 0) {
      console.log('✅ No entries need VAT amount fixes');
      return;
    }

    // Update each entry with calculated VAT amount
    const updatedEntries = await Promise.all(
      entriesToUpdate.map(async (entry) => {
        const vatAmount = Math.round(Number(entry.amount) * 0.075);
        
        return prisma.incomeEntry.update({
          where: { id: entry.id },
          data: {
            vatAmount: vatAmount
          }
        });
      })
    );

    console.log(`✅ Updated ${updatedEntries.length} entries with correct VAT amounts`);

    // Log updated entries
    updatedEntries.forEach(entry => {
      console.log(`📝 Entry ID ${entry.id}: ₦${entry.amount} → VAT ₦${Math.round(Number(entry.amount) * 0.075)}`);
    });

  } catch (error) {
    console.error('❌ Error updating VAT amounts:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔧 VAT amount fix script completed');
  }
}

// Run the script
fixVatAmounts();
