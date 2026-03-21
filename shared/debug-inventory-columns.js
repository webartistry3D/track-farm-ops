// Debug script to diagnose specific column issues
// Run this in browser console on the inventory page

console.log('🔍 DEBUGGING INVENTORY COLUMNS');

// Function to get detailed column analysis
function debugInventoryColumns() {
  console.log('\n📊 ANALYZING INVENTORY TABLE COLUMNS...');
  
  // Find inventory table
  const table = document.querySelector('table');
  if (!table) {
    console.log('❌ Inventory table not found');
    return false;
  }
  
  const tbody = table.querySelector('tbody');
  const rows = tbody ? tbody.querySelectorAll('tr') : [];
  
  if (rows.length === 0) {
    console.log('❌ No inventory rows found');
    console.log('💡 Add a new item first to have data to analyze');
    return false;
  }
  
  console.log(`Found ${rows.length} inventory rows`);
  
  // Analyze each row
  rows.forEach((row, rowIndex) => {
    const cells = row.querySelectorAll('td');
    
    if (cells.length >= 5) {
      const itemData = {
        name: cells[0]?.textContent?.trim() || '',
        type: cells[1]?.textContent?.trim() || '',
        quantity: cells[2]?.textContent?.trim() || '',
        status: cells[3]?.textContent?.trim() || '',
        transactions: cells[4]?.textContent?.trim() || '',
        hasUpdateButton: cells[5]?.querySelector('button')
      };
      
      console.log(`\n📋 ROW ${rowIndex + 1} ANALYSIS:`);
      console.log(`  Item Name: "${itemData.name}"`);
      console.log(`  Type: "${itemData.type}"`);
      console.log(`  Quantity: "${itemData.quantity}"`);
      console.log(`  Status: "${itemData.status}"`);
      console.log(`  Transactions: "${itemData.transactions}"`);
      console.log(`  Update Button: ${itemData.hasUpdateButton ? '✅' : '❌'}`);
      
      // Check for specific issues
      const issues = [];
      
      // Check Quantity column
      const quantityMatch = itemData.quantity.match(/(\d+)/);
      const quantity = quantityMatch ? parseInt(quantityMatch[1]) : null;
      if (quantity === null || quantity === 0 || isNaN(quantity)) {
        issues.push('Quantity is invalid or zero');
      } else if (quantity > 10000) {
        issues.push('Quantity seems unrealistic (>10000)');
      }
      
      // Check Status column
      const validStatuses = ['In Stock', 'Low Stock', 'Out of Stock'];
      const hasValidStatus = validStatuses.some(status => itemData.status.includes(status));
      if (!hasValidStatus) {
        issues.push(`Status "${itemData.status}" is not valid`);
      }
      
      // Check Transactions column
      const transactionCount = parseInt(itemData.transactions);
      if (isNaN(transactionCount) || transactionCount < 0) {
        issues.push(`Transactions "${itemData.transactions}" is not a valid number`);
      }
      
      // Report issues
      if (issues.length > 0) {
        console.log(`  ⚠️  ISSUES FOUND: ${issues.join(', ')}`);
      } else {
        console.log(`  ✅ All columns appear correct`);
      }
    }
  });
  
  return true;
}

// Function to check browser console for debug logs
function checkConsoleLogs() {
  console.log('\n🔍 CHECKING BROWSER CONSOLE LOGS...');
  console.log('💡 Look for the following debug messages:');
  console.log('  - "🔍 Item X Debug:" messages');
  console.log('  - These should show the actual item data structure');
  console.log('  - Check if _count.transactions exists and has correct value');
  console.log('  - Verify quantity, status, and transactions values');
  
  // Check if we can find the debug section in console
  const consoleOutput = document.querySelector('#console-output');
  if (consoleOutput) {
    console.log('✅ Console output element found');
  } else {
    console.log('ℹ️  Check the browser developer console (F12)');
    console.log('ℹ️  Look for the debug messages that start with "🔍 Item"');
  }
}

// Function to test with a specific item
function testSpecificItem() {
  console.log('\n🧪 TESTING SPECIFIC ITEM ANALYSIS...');
  
  const table = document.querySelector('table');
  if (!table) return false;
  
  const tbody = table.querySelector('tbody');
  const firstRow = tbody?.querySelector('tr');
  
  if (!firstRow) {
    console.log('❌ No rows found for specific item test');
    return false;
  }
  
  const cells = firstRow.querySelectorAll('td');
  if (cells.length >= 5) {
    const itemName = cells[0]?.textContent?.trim() || '';
    
    console.log(`📋 Analyzing item: "${itemName}"`);
    console.log('🔍 Check the browser console for detailed debug info about this item');
    console.log('💡 The debug message should show:');
    console.log('  - id, name, type, quantity, unit');
    console.log('  - stockStatus object');
    console.log('  - _count.transactions value');
    console.log('  - Full item object structure');
    
    // Try to click update button to test modal
    const updateButton = cells[5]?.querySelector('button');
    if (updateButton) {
      console.log('🔄 Clicking update button to test modal...');
      updateButton.click();
      
      setTimeout(() => {
        console.log('🔍 Check the modal content for hardcoded values');
        console.log('💡 Modal should show the actual item data, not hardcoded values');
      }, 1000);
    }
  }
  
  return true;
}

// Main diagnostic function
function runColumnDiagnostics() {
  console.log('🚀 STARTING INVENTORY COLUMN DIAGNOSTICS...\n');
  
  const tableTest = debugInventoryColumns();
  
  console.log('\n📋 DIAGNOSTIC SUMMARY:');
  console.log(`Table Analysis: ${tableTest ? '✅ COMPLETED' : '❌ FAILED'}`);
  
  if (tableTest) {
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Check browser console for "🔍 Item X Debug:" messages');
    console.log('2. Look at the actual data structure being received');
    console.log('3. Verify if _count.transactions exists and has correct value');
    console.log('4. Check if quantity, status, and transactions match expectations');
    console.log('5. Test update modal for hardcoded values');
    
    console.log('\n💡 EXPECTED BEHAVIOR:');
    console.log('- Quantity: Should show actual item quantity (e.g., 25, 50, 100)');
    console.log('- Status: Should show "In Stock", "Low Stock", or "Out of Stock"');
    console.log('- Transactions: Should show actual transaction count (0 for new items)');
    console.log('- Update Modal: Should show actual item data, not hardcoded values');
    
    console.log('\n🔧 POSSIBLE ISSUES:');
    console.log('- Backend _count query not working properly');
    console.log('- Frontend not receiving correct data structure');
    console.log('- Update modal showing sample/hardcoded data');
    console.log('- Data type mismatches between frontend and backend');
  } else {
    console.log('\n❌ DIAGNOSTICS FAILED');
    console.log('💡 Could not analyze inventory table properly');
  }
}

// Instructions
console.log('\n📝 HOW TO USE:');
console.log('1. Go to Inventory Items page');
console.log('2. Add a new item or ensure existing items are present');
console.log('3. Run runColumnDiagnostics() to analyze all columns');
console.log('4. Check browser console for detailed debug messages');
console.log('5. Run testSpecificItem() to test update modal');

// Auto-run if on inventory page
const table = document.querySelector('table');
if (table) {
  console.log('\n🚀 Inventory page found, running diagnostics...');
  runColumnDiagnostics();
} else {
  console.log('\n⏳ Inventory page not found');
  console.log('💡 Navigate to Inventory Items page first');
}

// Make functions available globally
window.runColumnDiagnostics = runColumnDiagnostics;
window.debugInventoryColumns = debugInventoryColumns;
window.testSpecificItem = testSpecificItem;
window.checkConsoleLogs = checkConsoleLogs;
