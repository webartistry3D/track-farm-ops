const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixIncomeAmount() {
  console.log('🔧 Fixing Income Record amount to match Invoice Records subtotal...');

  try {
    // Find all income entries
    const allEntries = await prisma.incomeEntry.findMany({
      select: {
        id: true,
        amount: true,
        subtotal: true,
        vatAmount: true,
        description: true,
        date: true
      }
    });

    console.log(`📊 Found ${allEntries.length} income entries:`);
    allEntries.forEach(entry => {
      console.log(`  Entry ${entry.id}: Amount=${entry.amount}, Subtotal=${entry.subtotal}, VAT=${entry.vatAmount}`);
    });

    // Find entries where amount != subtotal (should be subtotal, not total with VAT)
    const entriesToFix = allEntries.filter(entry => 
      entry.subtotal && entry.amount > entry.subtotal
    );

    console.log(`\n🔧 Found ${entriesToFix.length} entries to fix:`);

    for (const entry of entriesToFix) {
      console.log(`\n📝 Fixing entry ${entry.id}:`);
      console.log(`  Current: Amount=${entry.amount}, Subtotal=${entry.subtotal}`);
      console.log(`  Fix: Set Amount to Subtotal (${entry.subtotal})`);

      await prisma.incomeEntry.update({
        where: { id: entry.id },
        data: {
          amount: entry.subtotal // Set amount to equal subtotal
          // Keep VAT amount as is for VAT Records
        }
      });

      console.log(`✅ Fixed: Amount=${entry.subtotal}, VAT=${entry.vatAmount}`);
    }

    console.log(`\n✅ Successfully fixed ${entriesToFix.length} income entries`);
    console.log('💰 Income Records now show subtotal amounts (matching Invoice Records)');

  } catch (error) {
    console.error('❌ Error fixing income amounts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixIncomeAmount()
  .then(() => {
    console.log('🎉 Income amount fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Income amount fix failed:', error);
    process.exit(1);
  });
