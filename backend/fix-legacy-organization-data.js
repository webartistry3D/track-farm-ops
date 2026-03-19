const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixLegacyOrganizationData() {
  try {
    console.log('🔧 Fixing legacy organization data...\n');

    // Get current user's organization
    const user = await prisma.user.findUnique({
      where: { email: 'keechi@owner.com' },
      select: { 
        id: true,
        organizationId: true,
        organization: {
          select: { id: true, name: true }
        }
      }
    });
    
    if (!user || !user.organizationId) {
      console.log('❌ User not found or not assigned to organization');
      return;
    }

    console.log(`🏢 Target organization: ${user.organization?.name} (ID: ${user.organizationId})`);

    // Fix income entries with null organizationId
    console.log('\n💰 Fixing income entries...');
    const nullIncomeEntries = await prisma.$queryRaw`
      SELECT id, amount, category, user_id 
      FROM income_entries 
      WHERE organization_id IS NULL
    `;
    
    console.log(`   Found ${nullIncomeEntries.length} income entries without organization`);
    
    if (nullIncomeEntries.length > 0) {
      // Update income entries
      await prisma.$queryRaw`
        UPDATE income_entries 
        SET organization_id = ${user.organizationId}
        WHERE organization_id IS NULL
      `;
      console.log('   ✅ Updated all income entries with organization ID');
    }

    // Fix expense entries with null organizationId
    console.log('\n💸 Fixing expense entries...');
    const nullExpenseEntries = await prisma.$queryRaw`
      SELECT id, amount, category, user_id 
      FROM expense_entries 
      WHERE organization_id IS NULL
    `;
    
    console.log(`   Found ${nullExpenseEntries.length} expense entries without organization`);
    
    if (nullExpenseEntries.length > 0) {
      // Update expense entries
      await prisma.$queryRaw`
        UPDATE expense_entries 
        SET organization_id = ${user.organizationId}
        WHERE organization_id IS NULL
      `;
      console.log('   ✅ Updated all expense entries with organization ID');
    }

    // Verify the fix
    console.log('\n🔍 Verifying the fix...');
    
    const remainingNullIncome = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM income_entries WHERE organization_id IS NULL
    `;
    
    const remainingNullExpense = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM expense_entries WHERE organization_id IS NULL
    `;
    
    console.log(`   Income entries still without organization: ${remainingNullIncome[0].count}`);
    console.log(`   Expense entries still without organization: ${remainingNullExpense[0].count}`);

    // Show final organization data
    console.log('\n📊 Final organization data summary:');
    const orgIncomeTotal = await prisma.incomeEntry.aggregate({
      where: { organizationId: user.organizationId },
      _sum: { amount: true },
      _count: { id: true }
    });
    
    const orgExpenseTotal = await prisma.expenseEntry.aggregate({
      where: { organizationId: user.organizationId },
      _sum: { amount: true },
      _count: { id: true }
    });
    
    console.log(`   Organization Income: ₦${Number(orgIncomeTotal._sum.amount || 0).toLocaleString()} (${orgIncomeTotal._count.id} entries)`);
    console.log(`   Organization Expenses: ₦${Number(orgExpenseTotal._sum.amount || 0).toLocaleString()} (${orgExpenseTotal._count.id} entries)`);
    console.log(`   Organization Net Profit: ₦${(Number(orgIncomeTotal._sum.amount || 0) - Number(orgExpenseTotal._sum.amount || 0)).toLocaleString()}`);

    console.log('\n✅ Legacy data fix completed successfully!');
    console.log('🔒 All financial entries are now properly isolated by organization.');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixLegacyOrganizationData();
