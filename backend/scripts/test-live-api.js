const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testLiveAPI() {
  try {
    console.log('🔍 Testing LIVE API with exact same parameters as frontend');
    
    // Simulate the exact API call parameters
    const startDate = '2026-03-28';
    const endDate = '2026-03-28';
    
    console.log(`📅 Date range: ${startDate} to ${endDate}`);
    
    // Build the exact date filter the API uses
    const dateFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      // Set endDate to end of the day (23:59:59.999)
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter.lte = new Date(endOfDay); // Convert back to Date object
    }
    
    console.log(`🔍 Date filter object:`, dateFilter);
    console.log(`🔍 endDate type:`, typeof dateFilter.lte);
    console.log(`🔍 endDate value:`, dateFilter.lte);
    
    // Simulate the user context (assuming user ID 1, role OWNER, org ID 1)
    const currentUser = { id: 1, role: 'OWNER' };
    
    console.log(`👤 Current user:`, currentUser);
    
    // Get current user's organization
    const currentUserOrg = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { 
        organizationId: true,
        organization: { select: { name: true } }
      }
    });
    
    console.log(`🏢 User organization:`, currentUserOrg);
    
    // Multi-tenant: Get user IDs that the current user should see
    let userIds = [];
    if (currentUser.role === 'OWNER') {
      // Owners see data from themselves and all users they created
      const orgUsers = await prisma.user.findMany({
        where: {
          organizationId: currentUserOrg.organizationId
        },
        select: { id: true }
      });
      userIds = orgUsers.map(u => u.id);
    } else {
      userIds = [currentUser.id];
    }
    
    console.log(`👥 User IDs to include:`, userIds);
    
    // Build the complete where clause
    const whereClause = {
      userId: { in: userIds },
      organizationId: currentUserOrg.organizationId,
      date: dateFilter
    };
    
    console.log(`🔍 Complete where clause:`, whereClause);
    
    // Test the exact queries the API makes
    console.log(`\n📊 Testing income groupBy query:`);
    const incomeByCategory = await prisma.incomeEntry.groupBy({
      by: ['category'],
      where: whereClause,
      _sum: { amount: true }
    });
    
    console.log(`📊 Income by Category result:`, incomeByCategory);
    
    console.log(`\n📊 Testing expense groupBy query:`);
    const expensesByCategory = await prisma.expenseEntry.groupBy({
      by: ['category'],
      where: whereClause,
      _sum: { amount: true }
    });
    
    console.log(`📊 Expenses by Category result:`, expensesByCategory);
    
    // Test individual entries
    console.log(`\n📋 Testing individual income entries:`);
    const incomeEntries = await prisma.incomeEntry.findMany({
      where: whereClause,
      select: {
        id: true,
        amount: true,
        category: true,
        date: true,
        userId: true,
        organizationId: true
      }
    });
    
    console.log(`📋 Income entries found:`, incomeEntries.length);
    incomeEntries.forEach(entry => {
      console.log(`  Entry ${entry.id}: ₦${entry.amount.toLocaleString()}, ${entry.category}, ${entry.date.toISOString()}, User ${entry.userId}, Org ${entry.organizationId}`);
    });
    
    // Calculate totals like the API does
    const totalIncome = incomeByCategory.reduce((sum, cat) => sum + (cat._sum.amount || 0), 0);
    const totalExpenses = expensesByCategory.reduce((sum, cat) => sum + (cat._sum.amount || 0), 0);
    const netProfit = totalIncome - totalExpenses;
    
    console.log(`\n💰 Calculated totals:`);
    console.log(`  Total Income: ₦${totalIncome.toLocaleString()}`);
    console.log(`  Total Expenses: ₦${totalExpenses.toLocaleString()}`);
    console.log(`  Net Profit: ₦${netProfit.toLocaleString()}`);
    
    // Build the exact response the API should return
    const apiResponse = {
      totalIncome,
      totalExpenses,
      netProfit,
      incomeByCategory: incomeByCategory.map(cat => ({
        category: cat.category,
        amount: cat._sum.amount || 0
      })),
      expensesByCategory: expensesByCategory.map(cat => ({
        category: cat.category,
        amount: cat._sum.amount || 0
      }))
    };
    
    console.log(`\n📡 Expected API response:`, apiResponse);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLiveAPI();
