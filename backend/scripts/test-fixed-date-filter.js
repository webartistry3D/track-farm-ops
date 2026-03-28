const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFixedDateFilter() {
  try {
    console.log('🔍 Testing FIXED Date Filter Logic');
    
    // Test the exact fixed logic
    const startDate = '2026-03-28';
    const endDate = '2026-03-28';
    
    console.log(`📅 Date range: ${startDate} to ${endDate}`);
    
    // Apply the FIXED date filtering logic
    const dateFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      // Set endDate to end of the day (23:59:59.999)
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter.lte = new Date(endOfDay); // THE FIX: Convert back to Date object
    }
    
    console.log(`🔍 Fixed date filter object:`, dateFilter);
    console.log(`🔍 endDate type:`, typeof dateFilter.lte);
    console.log(`🔍 endDate value:`, dateFilter.lte);
    
    // Test with organization filtering (simulate the full API logic)
    const currentUserOrg = { organizationId: 1 };
    const userIds = [1, 2, 3, 4]; // All users in org
    
    const whereClause = {
      userId: { in: userIds },
      organizationId: currentUserOrg.organizationId,
      date: dateFilter
    };
    
    console.log(`🔍 Complete where clause:`, whereClause);
    
    // Test the groupBy query
    const incomeByCategory = await prisma.incomeEntry.groupBy({
      by: ['category'],
      where: whereClause,
      _sum: { amount: true }
    });
    
    console.log(`📊 Income by Category result:`, incomeByCategory);
    
    // Test individual date filters
    const filters = [
      { name: 'Today', startDate: '2026-03-28', endDate: '2026-03-28' },
      { name: 'Yesterday', startDate: '2026-03-27', endDate: '2026-03-27' },
      { name: 'Last 7 Days', startDate: '2026-03-21', endDate: '2026-03-28' },
      { name: 'Last 30 Days', startDate: '2026-02-26', endDate: '2026-03-28' }
    ];
    
    console.log('\n🧪 Testing all date filters:');
    
    for (const filter of filters) {
      const filterDateFilter = {};
      if (filter.startDate) {
        filterDateFilter.gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        const endOfDay = new Date(filter.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        filterDateFilter.lte = new Date(endOfDay);
      }
      
      const filterWhereClause = {
        userId: { in: userIds },
        organizationId: currentUserOrg.organizationId,
        date: filterDateFilter
      };
      
      const result = await prisma.incomeEntry.groupBy({
        by: ['category'],
        where: filterWhereClause,
        _sum: { amount: true }
      });
      
      console.log(`  ${filter.name}:`, result.length > 0 ? result : 'No results');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFixedDateFilter();
