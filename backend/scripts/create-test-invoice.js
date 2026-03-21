const { PrismaClient } = require('@prisma/client');

async function createTestInvoice() {
  const prisma = new PrismaClient();
  
  try {
    console.log('📝 Creating test invoice...');
    
    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'kelechi@owner.com' }
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    // Create test invoice
    const testInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `TEST-${Date.now()}`,
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        businessName: 'Test Business',
        items: JSON.stringify([
          { name: 'Test Item', quantity: 1, unitPrice: 100, total: 100 }
        ]),
        subtotal: 100,
        tax: 0,
        total: 100,
        status: 'PENDING',
        userId: adminUser.id,
        createdBy: adminUser.id
      }
    });
    
    console.log('✅ Test invoice created successfully!');
    console.log(`📄 Invoice #${testInvoice.invoiceNumber}`);
    console.log(`💰 Amount: $${testInvoice.total}`);
    console.log(`📊 Status: ${testInvoice.status}`);
    console.log(`🆔 ID: ${testInvoice.id}`);
    console.log('');
    console.log('🔗 You can now test marking this invoice as paid:');
    console.log(`PATCH https://track-farm-ops-backend.onrender.com/api/invoices/${testInvoice.id}/mark-paid`);
    
  } catch (error) {
    console.error('❌ Failed to create test invoice:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createTestInvoice();
}

module.exports = { createTestInvoice };
