const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixVATAmount() {
  console.log('🔧 Fixing VAT amount to 75,000 for 1,000,000 income...');

  try {
    // Find the entry with 1,075,000 amount
    const entry = await prisma.incomeEntry.findFirst({
      where: {
        amount: 1075000
      }
    });

    if (!entry) {
      console.log('❌ No entry found with 1,075,000 amount');
      return;
    }

    console.log(`📊 Found entry ${entry.id}: Current Amount=${entry.amount}, Current VAT=${entry.vatAmount}`);

    // Update to 1,000,000 amount with correct VAT
    const newAmount = 1000000;
    const vatRate = 7.5;
    const newVATAmount = (newAmount * vatRate) / 100; // 75,000
    const newSubtotal = newAmount / (1 + vatRate / 100); // 925,000

    await prisma.incomeEntry.update({
      where: { id: entry.id },
      data: {
        amount: newAmount,
        vatAmount: newVATAmount,
        subtotal: newSubtotal,
        enableVAT: true,
        vatRate: vatRate
      }
    });

    console.log(`✅ Updated entry ${entry.id}:`);
    console.log(`  Amount: ${entry.amount} → ${newAmount}`);
    console.log(`  VAT: ${entry.vatAmount} → ${newVATAmount}`);
    console.log(`  Subtotal: ${entry.subtotal} → ${newSubtotal}`);

    console.log('✅ VAT amount fixed to 75,000!');
  } catch (error) {
    console.error('❌ Error fixing VAT amount:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixVATAmount()
  .then(() => {
    console.log('🎉 VAT amount fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ VAT amount fix failed:', error);
    process.exit(1);
  });
