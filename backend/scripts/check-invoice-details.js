const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkInvoiceDetails() {
  console.log('🔍 Checking invoice details...');
  
  try {
    // Find all invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        invoiceNumber: {
          in: ['KEL-111112', 'KEL-111113', 'KEL-111114', 'KEL-111115']
        }
      }
    });

    console.log(`📊 Found ${invoices.length} invoices`);

    invoices.forEach(invoice => {
      console.log(`\n📋 Invoice ${invoice.invoiceNumber}:`);
      console.log(`  Client: ${invoice.clientName}`);
      console.log(`  Status: ${invoice.status}`);
      console.log(`  Total: ${invoice.total}`);
      console.log(`  Subtotal: ${invoice.subtotal}`);
      
      // Parse items from JSON field
      let items = [];
      if (invoice.items) {
        try {
          if (typeof invoice.items === 'string') {
            items = JSON.parse(invoice.items);
          } else if (typeof invoice.items === 'object' && invoice.items !== null) {
            items = [invoice.items]; // If it's already an object, wrap it in array
          }
        } catch (e) {
          console.log(`  ⚠️ Could not parse items: ${e.message}`);
        }
      }
      
      if (Array.isArray(items)) {
        let itemSubtotal = 0;
        items.forEach((item, index) => {
          const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
          itemSubtotal += itemTotal;
          
          console.log(`  Item ${index + 1}: ${item.description || 'Unknown'}`);
          console.log(`    Quantity: ${item.quantity}`);
          console.log(`    Unit Price: ₦${item.unitPrice}`);
          console.log(`    Item Total: ${itemTotal}`);
        });
        
        console.log(`  🧮 Calculated Subtotal from items: ${itemSubtotal}`);
        console.log(`  💰 Expected VAT (7.5%): ${itemSubtotal * 0.075}`);
        console.log(`  📊 Subtotal + VAT: ${itemSubtotal + (itemSubtotal * 0.075)}`);
        console.log(`  ✅ Invoice Subtotal matches: ${invoice.subtotal} === itemSubtotal ? 'YES' : 'NO'}`);
        console.log(`  📊 Invoice Total should be: ${itemSubtotal + (itemSubtotal * 0.075)}`);
      }
    });

  } catch (error) {
    console.error('❌ Error checking invoices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkInvoiceDetails();
