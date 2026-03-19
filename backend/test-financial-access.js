const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testOrganizationWideFinancialAccess() {
  try {
    console.log('🔍 Testing organization-wide financial records access...\n');

    // Get all users in the organization
    const orgUsers = await prisma.user.findMany({
      where: { organizationId: 6 },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: { role: 'asc' }
    });
    
    console.log(`👥 Found ${orgUsers.length} users in organization:`);
    orgUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // Check income records
    console.log('\n💰 Income Records:');
    const incomeRecords = await prisma.incomeEntry.findMany({
      where: {
        user: {
          organizationId: 6
        }
      },
      select: {
        id: true,
        amount: true,
        category: true,
        description: true,
        date: true,
        userId: true,
        user: {
          select: {
            name: true,
            role: true
          }
        }
      },
      take: 5
    });
    
    if (incomeRecords.length === 0) {
      console.log('   ℹ️  No income records found');
    } else {
      console.log(`   📊 Found ${incomeRecords.length} income records:`);
      incomeRecords.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.amount} - ${record.category} (${record.user.name} - ${record.user.role})`);
      });
    }

    // Check expense records
    console.log('\n💸 Expense Records:');
    const expenseRecords = await prisma.expenseEntry.findMany({
      where: {
        user: {
          organizationId: 6
        }
      },
      select: {
        id: true,
        amount: true,
        category: true,
        note: true,
        date: true,
        userId: true,
        user: {
          select: {
            name: true,
            role: true
          }
        }
      },
      take: 5
    });
    
    if (expenseRecords.length === 0) {
      console.log('   ℹ️  No expense records found');
    } else {
      console.log(`   📊 Found ${expenseRecords.length} expense records:`);
      expenseRecords.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.amount} - ${record.category} (${record.user.name} - ${record.user.role})`);
      });
    }

    // Check invoice records
    console.log('\n🧾 Invoice Records:');
    const invoiceRecords = await prisma.invoice.findMany({
      where: {
        user: {
          organizationId: 6
        }
      },
      select: {
        id: true,
        invoiceNumber: true,
        total: true,
        status: true,
        userId: true,
        user: {
          select: {
            name: true,
            role: true
          }
        }
      },
      take: 5
    });
    
    if (invoiceRecords.length === 0) {
      console.log('   ℹ️  No invoice records found');
    } else {
      console.log(`   📊 Found ${invoiceRecords.length} invoice records:`);
      invoiceRecords.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.invoiceNumber} - ${record.total} (${record.user.name} - ${record.user.role})`);
      });
    }

    console.log('\n🎯 Expected Access Results:');
    console.log('✅ OWNER: Should see ALL records from ALL users');
    console.log('✅ MANAGER: Should see ALL records from ALL users');
    console.log('✅ WORKER: Should see ALL records from ALL users');
    console.log('\n💡 Organization-Wide Access Logic:');
    console.log('   All users can see financial records created by any user in the organization');
    console.log('   No restrictions based on who created the record');
    console.log('   Only organization membership matters');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testOrganizationWideFinancialAccess();
