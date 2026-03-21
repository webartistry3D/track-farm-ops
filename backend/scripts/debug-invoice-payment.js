const { PrismaClient } = require('@prisma/client');

async function debugInvoicePayment() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Debugging invoice payment system...');
    
    // 1. Check admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'kelechi@owner.com' },
      include: { organization: true }
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      organizationId: adminUser.organizationId,
      organizationName: adminUser.organization?.name
    });
    
    // 2. Check invoices in the organization
    const invoices = await prisma.invoice.findMany({
      where: {
        user: {
          organizationId: adminUser.organizationId
        }
      },
      include: { user: true },
      take: 5
    });
    
    console.log(`📊 Found ${invoices.length} invoices in organization:`);
    invoices.forEach(invoice => {
      console.log(`  - Invoice #${invoice.invoiceNumber}: ${invoice.status} (ID: ${invoice.id})`);
    });
    
    // 3. Test permission logic
    console.log('🔐 Testing permission logic...');
    console.log(`  - User role: ${adminUser.role}`);
    console.log(`  - Can mark invoices as paid: ${adminUser.role === 'OWNER' || adminUser.role === 'MANAGER' || adminUser.role === 'WORKER'}`);
    
    // 4. Check if there are any pending invoices
    const pendingInvoices = invoices.filter(inv => inv.status === 'PENDING');
    console.log(`⏳ Pending invoices: ${pendingInvoices.length}`);
    
    if (pendingInvoices.length > 0) {
      console.log('📝 Sample pending invoice for testing:');
      const sample = pendingInvoices[0];
      console.log(`  - ID: ${sample.id}`);
      console.log(`  - Number: ${sample.invoiceNumber}`);
      console.log(`  - Client: ${sample.clientName}`);
      console.log(`  - Amount: ${sample.total}`);
      console.log(`  - Status: ${sample.status}`);
    }
    
    console.log('✅ Debug completed successfully');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  debugInvoicePayment();
}

module.exports = { debugInvoicePayment };
