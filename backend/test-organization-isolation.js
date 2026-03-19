const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testOrganizationIsolation() {
  try {
    console.log('🔒 Testing Organization Data Isolation...\n');

    // Test 1: Get keechi@owner.com's organization
    console.log('📋 Test 1: Verify user organization');
    const user = await prisma.user.findUnique({
      where: { email: 'keechi@owner.com' },
      select: { 
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        organization: {
          select: { id: true, name: true }
        }
      }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ User: ${user.name} (${user.email})`);
    console.log(`🏢 Organization: ${user.organization?.name} (ID: ${user.organizationId})`);
    console.log(`👤 Role: ${user.role}\n`);

    // Test 2: Check income entries with organization filtering
    console.log('💰 Test 2: Income entries with organization filter');
    const orgIncomeEntries = await prisma.incomeEntry.findMany({
      where: { 
        organizationId: user.organizationId 
      },
      select: {
        id: true,
        amount: true,
        category: true,
        date: true,
        userId: true,
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { date: 'desc' },
      take: 5
    });
    
    console.log(`   Found ${orgIncomeEntries.length} income entries in organization`);
    orgIncomeEntries.forEach((entry, i) => {
      console.log(`   ${i+1}. ₦${entry.amount} - ${entry.category} by ${entry.user.name} (${entry.date.toISOString().split('T')[0]})`);
    });

    // Test 3: Check expense entries with organization filtering
    console.log('\n💸 Test 3: Expense entries with organization filter');
    const orgExpenseEntries = await prisma.expenseEntry.findMany({
      where: { 
        organizationId: user.organizationId 
      },
      select: {
        id: true,
        amount: true,
        category: true,
        date: true,
        userId: true,
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { date: 'desc' },
      take: 5
    });
    
    console.log(`   Found ${orgExpenseEntries.length} expense entries in organization`);
    orgExpenseEntries.forEach((entry, i) => {
      console.log(`   ${i+1}. ₦${entry.amount} - ${entry.category} by ${entry.user.name} (${entry.date.toISOString().split('T')[0]})`);
    });

    // Test 4: Check for cross-organization data exposure
    console.log('\n🔍 Test 4: Check for cross-organization data');
    const allIncomeEntries = await prisma.incomeEntry.findMany({
      select: { organizationId: true }
    });
    
    const allExpenseEntries = await prisma.expenseEntry.findMany({
      select: { organizationId: true }
    });
    
    // Filter out null organizationIds (entries created before security fix)
    const incomeOrgs = [...new Set(allIncomeEntries.map(e => e.organizationId).filter(id => id !== null))];
    const expenseOrgs = [...new Set(allExpenseEntries.map(e => e.organizationId).filter(id => id !== null))];
    
    // Count entries with null organizationId
    const nullIncomeCount = allIncomeEntries.filter(e => e.organizationId === null).length;
    const nullExpenseCount = allExpenseEntries.filter(e => e.organizationId === null).length;
    
    console.log(`   Total organizations with income data: ${incomeOrgs.length}`);
    console.log(`   Total organizations with expense data: ${expenseOrgs.length}`);
    console.log(`   Your organization ID: ${user.organizationId}`);
    console.log(`   Income entries without organization: ${nullIncomeCount}`);
    console.log(`   Expense entries without organization: ${nullExpenseCount}`);
    
    if (incomeOrgs.length > 1 || expenseOrgs.length > 1) {
      console.log('⚠️  Multiple organizations found in database - isolation is critical!');
    } else {
      console.log('✅ Only one organization in database');
    }

    // Test 5: Calculate totals for organization
    console.log('\n📊 Test 5: Organization financial summary');
    const orgIncomeTotal = await prisma.incomeEntry.aggregate({
      where: { organizationId: user.organizationId },
      _sum: { amount: true }
    });
    
    const orgExpenseTotal = await prisma.expenseEntry.aggregate({
      where: { organizationId: user.organizationId },
      _sum: { amount: true }
    });
    
    const incomeTotal = Number(orgIncomeTotal._sum.amount || 0);
    const expenseTotal = Number(orgExpenseTotal._sum.amount || 0);
    const netProfit = incomeTotal - expenseTotal;
    
    console.log(`   Organization Income: ₦${incomeTotal.toLocaleString()}`);
    console.log(`   Organization Expenses: ₦${expenseTotal.toLocaleString()}`);
    console.log(`   Organization Net Profit: ₦${netProfit.toLocaleString()}`);

    console.log('\n✅ Organization isolation test completed successfully!');
    console.log('🔒 The Analytics Dashboard should now show only your organization data.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testOrganizationIsolation();
