import { prisma } from '../lib/prisma';

/**
 * Script to fix invoice data with incorrect VAT calculations
 * This script will:
 * 1. Identify invoices where VAT is not exactly 7.5% of subtotal
 * 2. Recalculate correct VAT and total amounts
 * 3. Update both invoice records and related income entries
 */

const VAT_RATE = 0.075; // 7.5%

async function fixInvoiceData() {
  console.log('🔧 Starting invoice data fix script...');
  
  try {
    // Find all invoices that need fixing
    const invoices = await prisma.invoice.findMany({
      where: {
        status: 'PAID' // Only fix paid invoices that have income entries
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    console.log(`📊 Found ${invoices.length} paid invoices to check...`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const invoice of invoices) {
      const currentSubtotal = Number(invoice.subtotal) || 0;
      const currentTax = Number(invoice.tax) || 0;
      const currentTotal = Number(invoice.total) || 0;
      
      // Calculate expected values
      const expectedTax = currentSubtotal * VAT_RATE;
      const expectedTotal = currentSubtotal + expectedTax;
      
      // Check if correction is needed (allow small rounding differences)
      const taxDifference = Math.abs(currentTax - expectedTax);
      const totalDifference = Math.abs(currentTotal - expectedTotal);
      
      if (taxDifference > 1 || totalDifference > 1) { // Allow 1 naira rounding difference
        console.log(`\n🔍 Fixing invoice: ${invoice.invoiceNumber}`);
        console.log(`   Current: Subtotal ₦${currentSubtotal}, Tax ₦${currentTax}, Total ₦${currentTotal}`);
        console.log(`   Expected: Subtotal ₦${currentSubtotal}, Tax ₦${expectedTax.toFixed(2)}, Total ₦${expectedTotal.toFixed(2)}`);
        console.log(`   Tax difference: ₦${taxDifference.toFixed(2)}`);
        
        // Update the invoice
        const updatedInvoice = await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            tax: expectedTax,
            total: expectedTotal
          }
        });
        
        console.log(`   ✅ Invoice updated: ${updatedInvoice.invoiceNumber}`);
        
        // Find related income entries by looking in metadata
        const incomeEntries = await prisma.incomeEntry.findMany({
          where: {
            metadata: {
              path: ['invoiceId'],
              equals: invoice.id
            }
          }
        });
        
        if (incomeEntries.length > 0) {
          for (const incomeEntry of incomeEntries) {
            // For this specific case, we know the expected subtotal should be 400,000
            // when we see 430,000 with 30,000 VAT (which is incorrect VAT calculation)
            if (currentSubtotal === 430000 && currentTax === 30000) {
              // This is the specific case: subtotal should be 400,000, not 430,000
              const correctSubtotal = 400000;
              const correctTax = correctSubtotal * VAT_RATE;
              const correctTotal = correctSubtotal + correctTax;
              
              await prisma.invoice.update({
                where: { id: invoice.id },
                data: {
                  subtotal: correctSubtotal,
                  tax: correctTax,
                  total: correctTotal
                }
              });
              
              // Update the income entry amount
              await prisma.incomeEntry.update({
                where: { id: incomeEntry.id },
                data: {
                  amount: correctSubtotal,
                  vatAmount: correctTax
                }
              });
              
              console.log(`   ✅ Income entry updated: ₦${incomeEntry.amount} → ₦${correctSubtotal}`);
              console.log(`   ✅ VAT updated: ₦${incomeEntry.vatAmount || 0} → ₦${correctTax.toFixed(2)}`);
            } else {
              // General case: update VAT amount in income entry
              await prisma.incomeEntry.update({
                where: { id: incomeEntry.id },
                data: {
                  vatAmount: expectedTax
                }
              });
              
              console.log(`   ✅ Income VAT updated: ₦${incomeEntry.vatAmount || 0} → ₦${expectedTax.toFixed(2)}`);
            }
          }
        } else {
          console.log(`   ⚠️ No income entries found for invoice ${invoice.invoiceNumber}`);
        }
        
        fixedCount++;
      } else {
        console.log(`✅ Invoice ${invoice.invoiceNumber} - Correct (skipped)`);
        skippedCount++;
      }
    }
    
    console.log(`\n📈 Summary:`);
    console.log(`   Fixed invoices: ${fixedCount}`);
    console.log(`   Skipped invoices: ${skippedCount}`);
    console.log(`   Total checked: ${invoices.length}`);
    
  } catch (error) {
    console.error('❌ Error fixing invoice data:', error);
    throw error;
  }
}

// Specific fix for the known issue: UCH-000003
async function fixSpecificInvoice() {
  console.log('🔧 Fixing specific invoice UCH-000003...');
  
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        invoiceNumber: 'UCH-000003'
      }
    });
    
    if (!invoice) {
      console.log('❌ Invoice UCH-000003 not found');
      return;
    }
    
    console.log(`📊 Found invoice: ${invoice.invoiceNumber}`);
    console.log(`   Current: Subtotal ₦${invoice.subtotal}, Tax ₦${invoice.tax}, Total ₦${invoice.total}`);
    
    // Fix the values
    const correctSubtotal = 400000;
    const correctTax = correctSubtotal * VAT_RATE; // 30,000
    const correctTotal = correctSubtotal + correctTax; // 430,000
    
    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        subtotal: correctSubtotal,
        tax: correctTax,
        total: correctTotal
      }
    });
    
    console.log(`✅ Invoice updated: ${updatedInvoice.invoiceNumber}`);
    console.log(`   New: Subtotal ₦${updatedInvoice.subtotal}, Tax ₦${updatedInvoice.tax}, Total ₦${updatedInvoice.total}`);
    
    // Find and update income entries
    const incomeEntries = await prisma.incomeEntry.findMany({
      where: {
        metadata: {
          path: ['invoiceId'],
          equals: invoice.id
        }
      }
    });
    
    if (incomeEntries.length > 0) {
      for (const incomeEntry of incomeEntries) {
        await prisma.incomeEntry.update({
          where: { id: incomeEntry.id },
          data: {
            amount: correctSubtotal,
            vatAmount: correctTax
          }
        });
        
        console.log(`✅ Income entry updated: Amount ₦${incomeEntry.amount} → ₦${correctSubtotal}, VAT ₦${incomeEntry.vatAmount || 0} → ₦${correctTax}`);
      }
    } else {
      console.log(`⚠️ No income entries found for invoice ${invoice.invoiceNumber}`);
    }
    
    console.log('✅ Specific invoice fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing specific invoice:', error);
    throw error;
  }
}

// Run the script
async function main() {
  try {
    // Check if we want to fix all invoices or just the specific one
    const fixSpecific = process.argv.includes('--specific');
    
    if (fixSpecific) {
      await fixSpecificInvoice();
    } else {
      await fixInvoiceData();
    }
    
    console.log('\n🎉 Invoice data fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

export { fixInvoiceData, fixSpecificInvoice };
