const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSpecificUsers() {
  try {
    console.log('🔍 Checking for kelechi@manager.com and kelechi@worker.com...\n');

    // Check for manager
    const manager = await prisma.user.findUnique({
      where: { email: 'kelechi@manager.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true
      }
    });

    // Check for worker
    const worker = await prisma.user.findUnique({
      where: { email: 'kelechi@worker.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true
      }
    });

    console.log('👤 Manager User:');
    if (manager) {
      console.log(`   ✅ Found: ${manager.name} (${manager.email}) - Role: ${manager.role} - Org ID: ${manager.organizationId}`);
      
      // Check their records
      const managerInvoices = await prisma.invoice.count({ where: { userId: manager.id } });
      const managerIncome = await prisma.incomeEntry.count({ where: { userId: manager.id } });
      const managerExpenses = await prisma.expenseEntry.count({ where: { userId: manager.id } });
      
      console.log(`   📊 Records: ${managerInvoices} invoices, ${managerIncome} income, ${managerExpenses} expenses`);
    } else {
      console.log('   ❌ Not found');
    }

    console.log('\n👷 Worker User:');
    if (worker) {
      console.log(`   ✅ Found: ${worker.name} (${worker.email}) - Role: ${worker.role} - Org ID: ${worker.organizationId}`);
      
      // Check their records
      const workerInvoices = await prisma.invoice.count({ where: { userId: worker.id } });
      const workerIncome = await prisma.incomeEntry.count({ where: { userId: worker.id } });
      const workerExpenses = await prisma.expenseEntry.count({ where: { userId: worker.id } });
      
      console.log(`   📊 Records: ${workerInvoices} invoices, ${workerIncome} income, ${workerExpenses} expenses`);
    } else {
      console.log('   ❌ Not found');
    }

    // Check owner's organization
    const owner = await prisma.user.findUnique({
      where: { email: 'keechi@owner.com' },
      select: { organizationId: true }
    });

    console.log('\n🏢 Organization Analysis:');
    console.log(`   Owner (keechi@owner.com) Organization ID: ${owner?.organizationId}`);
    console.log(`   Manager Organization ID: ${manager?.organizationId}`);
    console.log(`   Worker Organization ID: ${worker?.organizationId}`);

    if (manager && owner && manager.organizationId !== owner.organizationId) {
      console.log('   🚨 ISSUE: Manager is in a DIFFERENT organization than owner!');
      console.log('   💡 This explains why owner doesn\'t see manager records');
    }

    if (worker && owner && worker.organizationId !== owner.organizationId) {
      console.log('   🚨 ISSUE: Worker is in a DIFFERENT organization than owner!');
      console.log('   💡 This explains why owner doesn\'t see worker records');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificUsers();
