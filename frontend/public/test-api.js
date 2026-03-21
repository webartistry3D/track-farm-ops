// Simple API test script - run this in browser console when logged in

async function testInventoryAPI() {
  console.log('🔍 Testing Inventory API...');
  
  try {
    // Get inventory items
    const response = await fetch('/api/inventory/items', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const items = await response.json();
    console.log(`📊 Found ${items.length} items`);
    
    // Calculate totals
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const pricePerUnit = item.metadata?.pricePerUnit ? Number(item.metadata.pricePerUnit) : 0;
      return sum + (quantity * pricePerUnit);
    }, 0);
    const averageValue = totalItems > 0 ? totalValue / totalItems : 0;
    const lowStockItems = items.filter(item => Number(item.quantity) < 10).length;
    
    console.log('📋 Results:');
    console.log(`  Total Items: ${totalItems}`);
    console.log(`  Total Value: ₦${totalValue.toLocaleString()}`);
    console.log(`  Average Value: ₦${averageValue.toLocaleString()}`);
    console.log(`  Low Stock Items: ${lowStockItems}`);
    
    // Show sample items
    console.log('📋 Sample items:');
    items.slice(0, 3).forEach((item, index) => {
      const quantity = Number(item.quantity) || 0;
      const pricePerUnit = item.metadata?.pricePerUnit ? Number(item.metadata.pricePerUnit) : 0;
      const value = quantity * pricePerUnit;
      console.log(`  ${index + 1}. ${item.name}: ${quantity} × ₦${pricePerUnit.toLocaleString()} = ₦${value.toLocaleString()}`);
    });
    
    // Check if values are correct
    const isCorrect = totalItems === 80 && totalValue === 0 && averageValue === 0 && lowStockItems === 80;
    console.log(`\n${isCorrect ? '✅' : '❌'} Values ${isCorrect ? 'correct' : 'incorrect'}`);
    
    return { totalItems, totalValue, averageValue, lowStockItems, isCorrect };
    
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
}

// Auto-run
testInventoryAPI();
