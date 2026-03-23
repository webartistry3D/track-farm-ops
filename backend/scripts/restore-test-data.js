const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function restoreTestData() {
  try {
    console.log('🔄 Restoring test data to database...\n');
    
    // Get the organization (should be ID 1 - "default")
    const organization = await prisma.organization.findFirst({
      where: { name: 'default' }
    });
    
    if (!organization) {
      console.log('❌ No organization found');
      return;
    }
    
    console.log(`🏢 Using organization: ${organization.name} (ID: ${organization.id})`);
    
    // Get the owner user
    const owner = await prisma.user.findFirst({
      where: { role: 'OWNER', organizationId: organization.id }
    });
    
    if (!owner) {
      console.log('❌ No owner user found');
      return;
    }
    
    console.log(`👤 Using owner: ${owner.name} (ID: ${owner.id})`);
    
    // 1. Create Income Entries
    console.log('\n💰 Creating Income Entries...');
    
    const incomeData = [
      {
        amount: 3762500,
        category: 'Sales',
        paymentMethod: 'TRANSFER',
        date: new Date('2026-03-18'),
        description: 'Payment for invoice #KEL-11112 - Kelechi Client 1 [Invoice Creator: Kelechi Worker]',
        organizationId: organization.id,
        userId: owner.id
      },
      {
        amount: 75250000,
        category: 'Sales',
        paymentMethod: 'TRANSFER',
        date: new Date('2026-03-18'),
        description: 'Payment for invoice #KEL-11116 - Kelechi Client 4 [Invoice Creator: Owner]',
        organizationId: organization.id,
        userId: owner.id
      },
      {
        amount: 5375000,
        category: 'Sales',
        paymentMethod: 'TRANSFER',
        date: new Date('2026-03-18'),
        description: 'Payment for invoice #KEL-111117 - Kelechi Client 7 [Invoice Creator: Kelechi Manager]',
        organizationId: organization.id,
        userId: owner.id
      }
    ];
    
    for (const income of incomeData) {
      const existing = await prisma.incomeEntry.findFirst({
        where: {
          amount: income.amount,
          category: income.category,
          description: income.description,
          date: income.date
        }
      });
      
      if (!existing) {
        await prisma.incomeEntry.create({ data: income });
        console.log(`✅ Created income: ₦${income.amount.toLocaleString()} - ${income.category}`);
      } else {
        console.log(`⏭️ Income already exists: ₦${income.amount.toLocaleString()} - ${income.category}`);
      }
    }
    
    // 2. Create Expense Entries
    console.log('\n💸 Creating Expense Entries...');
    
    const expenseData = [
      {
        amount: 89.99,
        category: 'Feed',
        date: new Date('2026-03-10'),
        note: 'Animal feed purchase',
        organizationId: organization.id,
        userId: owner.id,
        merchant: 'Feed Supplier'
      },
      {
        amount: 61000,
        category: 'Other',
        date: new Date('2026-03-15'),
        note: 'Farm supplies and equipment',
        organizationId: organization.id,
        userId: owner.id,
        merchant: 'Farm Supply Store'
      },
      {
        amount: 1500,
        category: 'Transport',
        date: new Date('2026-03-12'),
        note: 'Transportation costs',
        organizationId: organization.id,
        userId: owner.id,
        merchant: 'Transport Service'
      }
    ];
    
    for (const expense of expenseData) {
      const existing = await prisma.expenseEntry.findFirst({
        where: {
          amount: expense.amount,
          category: expense.category,
          note: expense.note,
          date: expense.date
        }
      });
      
      if (!existing) {
        await prisma.expenseEntry.create({ data: expense });
        console.log(`✅ Created expense: ₦${expense.amount.toLocaleString()} - ${expense.category}`);
      } else {
        console.log(`⏭️ Expense already exists: ₦${expense.amount.toLocaleString()} - ${expense.category}`);
      }
    }
    
    // 3. Create Invoices
    console.log('\n🧾 Creating Invoices...');
    
    const invoiceData = [
      {
        invoiceNumber: 'KEL-11112',
        clientName: 'Kelechi Client 1',
        businessName: 'Kelechi Farm',
        items: JSON.stringify([
          { name: 'Product A', quantity: 50, price: 75250 }
        ]),
        subtotal: 3500000,
        tax: 262500,
        total: 3762500,
        status: 'PAID',
        paymentMethod: 'TRANSFER',
        dueDate: new Date('2026-03-18'),
        userId: owner.id,
        createdBy: owner.id
      },
      {
        invoiceNumber: 'KEL-11116',
        clientName: 'Kelechi Client 4',
        businessName: 'Kelechi Farm',
        items: JSON.stringify([
          { name: 'Product B', quantity: 20, price: 3762500 }
        ]),
        subtotal: 70000000,
        tax: 5250000,
        total: 75250000,
        status: 'PAID',
        paymentMethod: 'TRANSFER',
        dueDate: new Date('2026-03-18'),
        userId: owner.id,
        createdBy: owner.id
      },
      {
        invoiceNumber: 'KEL-111117',
        clientName: 'Kelechi Client 7',
        businessName: 'Kelechi Farm',
        items: JSON.stringify([
          { name: 'Product C', quantity: 10, price: 537500 }
        ]),
        subtotal: 5000000,
        tax: 375000,
        total: 5375000,
        status: 'PAID',
        paymentMethod: 'TRANSFER',
        dueDate: new Date('2026-03-18'),
        userId: owner.id,
        createdBy: owner.id
      }
    ];
    
    for (const invoice of invoiceData) {
      const existing = await prisma.invoice.findFirst({
        where: { invoiceNumber: invoice.invoiceNumber }
      });
      
      if (!existing) {
        await prisma.invoice.create({ data: invoice });
        console.log(`✅ Created invoice: ${invoice.invoiceNumber} - ₦${invoice.total.toLocaleString()}`);
      } else {
        console.log(`⏭️ Invoice already exists: ${invoice.invoiceNumber}`);
      }
    }
    
    console.log('\n🎉 Test data restoration completed successfully!');
    
    // Show final counts
    const finalIncome = await prisma.incomeEntry.count();
    const finalExpenses = await prisma.expenseEntry.count();
    const finalInvoices = await prisma.invoice.count();
    
    console.log(`\n📊 Final Database State:`);
    console.log(`💰 Income Entries: ${finalIncome}`);
    console.log(`💸 Expense Entries: ${finalExpenses}`);
    console.log(`🧾 Invoices: ${finalInvoices}`);
    
  } catch (error) {
    console.error('❌ Restoration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreTestData();
