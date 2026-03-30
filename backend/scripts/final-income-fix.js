const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function finalIncomeFix() {
  console.log('🔧 Starting FINAL income amount fix...');
  
  try {
    // Find all income entries that need correction
    const entriesToFix = await prisma.incomeEntry.findMany({
      where: {
        description: {
          contains: 'Payment for invoice #' // Only fix invoice-based entries
        }
      }
    });

    console.log(`📊 Found ${entriesToFix.length} invoice-based income entries to fix`);

    if (entriesToFix.length === 0) {
      console.log('✅ No income entries need fixing');
      return;
    }

    // Fix each entry with correct amounts based on invoice data
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
        
        // Find the original invoice to get correct subtotal
        const invoice = await prisma.invoice.findFirst({
          where: { invoiceNumber }
        });

        if (!invoice) {
          console.log(`⚠️ Could not find invoice ${invoiceNumber}`);
          return null;
        }

        const correctSubtotal = Number(invoice.subtotal) || 0;
        const correctVatAmount = correctSubtotal * 0.075;
        
        console.log(`🔧 Fixing ${invoiceNumber}:`);
        console.log(`  Current amount: ₦${currentAmount} (includes VAT)`);
        console.log(`  Invoice subtotal: ₦${correctSubtotal} (correct)`);
        console.log(`  Current VAT: ₦${storedVatAmount} → Correct VAT: ₦${correctVatAmount}`);
        console.log(`  ✅ Updating income amount to: ₦${correctSubtotal}`);

        return prisma.incomeEntry.update({
          where: { id: entry.id },
          data: {
            amount: correctSubtotal,
            vatAmount: correctVatAmount
          }
        });
      })
    );

    // Log results
    const successfulUpdates = updatedEntries.filter(entry => entry !== null);
    console.log(`✅ Successfully updated ${successfulUpdates.length} income entries`);
    
    successfulUpdates.forEach(entry => {
      console.log(`📝 Entry ID ${entry.id}: ₦${entry.amount} → ₦${entry.amount}`);
    });

  } catch (error) {
    console.error('❌ Error updating income amounts:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔧 FINAL income amount fix completed');
  }
}

// Run the final fix
finalIncomeFix();
