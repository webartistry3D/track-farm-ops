const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixVATCalculation() {
  console.log('🔧 Fixing VAT calculation to 7.5% of ₦1,000,000 = ₦75,000...');

  try {
    // Find the income entry
    const entry = await prisma.incomeEntry.findFirst({
      where: {
        amount: 1000000
      }
    });

    if (!entry) {
      console.log('❌ No entry found with 1,000,000 amount');
      return;
    }

    console.log(`📊 Found entry ${entry.id}:`);
    console.log(`  Current Amount: ₦${entry.amount.toLocaleString()}`);
    console.log(`  Current VAT: ₦${entry.vatAmount?.toLocaleString()}`);
    console.log(`  Current Rate: ${entry.vatRate}%`);

    // Calculate correct VAT: 7.5% of 1,000,000 = 75,000
    const correctVATAmount = 75000;
    const vatRate = 7.5;

    console.log(`\n🔧 Fixing VAT calculation:`);
    console.log(`  Correct VAT: ₦${correctVATAmount.toLocaleString()} (7.5% of ₦1,000,000)`);

    await prisma.incomeEntry.update({
      where: { id: entry.id },
      data: {
        vatAmount: correctVATAmount,
        vatRate: vatRate,
        // Keep subtotal as 1,000,000 and amount as 1,000,000
      }
    });

    console.log(`✅ Fixed VAT amount to ₦${correctVATAmount.toLocaleString()}`);

  } catch (error) {
    console.error('❌ Error fixing VAT calculation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixVATCalculation()
  .then(() => {
    console.log('🎉 VAT calculation fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ VAT calculation fix failed:', error);
    process.exit(1);
  });
