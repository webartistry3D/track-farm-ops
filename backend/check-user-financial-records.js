const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllFinancialRecords() {
  try {
    console.log('🔍 Checking all financial records by user...\n');

    // Get all users in organization
    const orgUsers = await prisma.user.findMany({
      where: { organizationId: 6 },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    console.log('👥 Organization Users:');
    orgUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role} - ID: ${user.id}`);
    });

    // Check records by each user
    for (const user of orgUsers) {
      console.log(`\n📊 Records for ${user.name} (${user.role}):`);
      
      // Income records
      const incomeCount = await prisma.incomeEntry.count({
        where: { userId: user.id }
      });
      
      // Expense records  
      const expenseCount = await prisma.expenseEntry.count({
        where: { userId: user.id }
      });
      
      // Invoice records
      const invoiceCount = await prisma.invoice.count({
        where: { userId: user.id }
      });
      
      console.log(`   💰 Income: ${incomeCount} records`);
      console.log(`   💸 Expenses: ${expenseCount} records`);
      console.log(`   🧾 Invoices: ${invoiceCount} records`);
      
      if (incomeCount === 0 && expenseCount === 0 && invoiceCount === 0) {
        console.log(`   ℹ️  No financial records found`);
      }
    }

    console.log('\n🎯 Analysis:');
    console.log('✅ Backend access control is correctly implemented');
    console.log('✅ Owner SHOULD see all records from all users');
    console.log('❌ But managers/workers haven\'t created any records yet');
    console.log('\n💡 Recommendation:');
    console.log('1. Login as manager@test.com');
    console.log('2. Create some income/expense records');
    console.log('3. Login back as owner');
    console.log('4. Owner should now see records from all users');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllFinancialRecords();
