const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixIncomeAmounts() {
  console.log('🔧 Starting income amounts fix script...');
  
  try {
    // Find income entries that came from invoices and have incorrect amounts
    const entriesToFix = await prisma.incomeEntry.findMany({
      where: {
        description: {
          contains: 'Payment for invoice #' // Only fix invoice-based entries
        }
      }
    });

    console.log(`📊 Found ${entriesToFix.length} invoice-based income entries to check`);

    if (entriesToFix.length === 0) {
      console.log('✅ No invoice-based entries need fixing');
      return;
    }

    // Update each entry with correct amount (remove VAT)
    const updatedEntries = await Promise.all(
      entriesToFix.map(async (entry) => {
        // Extract invoice number from description
        const match = entry.description.match(/Payment for invoice #([^\s]+)/);
        if (!match) {
          console.log(`⚠️ Could not extract invoice number from: ${entry.description}`);
          return null;
        }

        const invoiceNumber = match[1];
        const currentAmount = Number(entry.amount);
        const storedVatAmount = Number(entry.vatAmount) || 0;
        
        // Calculate correct amount (remove VAT from current amount)
        // If current amount includes VAT, remove it to get subtotal
        let correctAmount = currentAmount;
        if (storedVatAmount > 0) {
          // VAT was included, so remove it
          const vatRate = 0.075; // 7.5%
          correctAmount = Math.round(currentAmount / (1 + vatRate));
          console.log(`🔧 Fixing ${invoiceNumber}: Current ₦${currentAmount} includes VAT ₦${storedVatAmount}, correcting to subtotal ₦${correctAmount}`);
        } else {
          console.log(`✅ ${invoiceNumber}: Amount ₦${currentAmount} already correct (no VAT included)`);
        }

        return prisma.incomeEntry.update({
          where: { id: entry.id },
          data: {
            amount: correctAmount
          }
        });
      })
    );

    // Log results
    console.log(`✅ Updated ${updatedEntries.length} income entries with correct amounts`);
    updatedEntries.forEach(entry => {
      if (entry) {
        console.log(`📝 Entry ID ${entry.id}: ₦${entry.amount} → ₦${entry.amount}`);
      }
    });

  } catch (error) {
    console.error('❌ Error updating income amounts:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔧 Income amounts fix script completed');
  }
}

// Run the script
fixIncomeAmounts();
