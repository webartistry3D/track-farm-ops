// Test script to diagnose inventory issues
// Run this in browser console on the inventory page

console.log('🔍 INVENTORY ISSUES DIAGNOSIS');

// Test function to check inventory table data
function testInventoryTableData() {
  console.log('\n📊 CHECKING INVENTORY TABLE DATA...');
  
  // Find inventory table
  const table = document.querySelector('table');
  if (!table) {
    console.log('❌ Inventory table not found');
    return false;
  }
  
  console.log('✅ Inventory table found');
  
  // Get all rows in table body
  const tbody = table.querySelector('tbody');
  const rows = tbody ? tbody.querySelectorAll('tr') : [];
  
  if (rows.length === 0) {
    console.log('❌ No inventory rows found');
    return false;
  }
  
  console.log(`Found ${rows.length} inventory rows`);
  
  // Check first row data structure
  const firstRow = rows[0];
  const cells = firstRow.querySelectorAll('td');
  
  console.log('\n📋 FIRST ROW DATA STRUCTURE:');
  console.log(`- Cells found: ${cells.length}`);
  
  cells.forEach((cell, index) => {
    const cellText = cell.textContent?.trim() || '';
    console.log(`  Cell ${index + 1}: "${cellText}"`);
  });
  
  // Expected columns: Item, Type, Quantity, Status, Transactions, Actions
  const expectedColumns = ['Item', 'Type', 'Quantity', 'Status', 'Transactions', 'Actions'];
  if (cells.length !== expectedColumns.length) {
    console.log(`⚠️  Expected ${expectedColumns.length} columns, found ${cells.length}`);
  }
  
  return true;
}

// Test function to check Quantity column specifically
function testQuantityColumn() {
  console.log('\n🔢 CHECKING QUANTITY COLUMN...');
  
  const table = document.querySelector('table');
  if (!table) return false;
  
  const tbody = table.querySelector('tbody');
  const rows = tbody ? tbody.querySelectorAll('tr') : [];
  
  let quantityIssues = [];
  
  rows.forEach((row, index) => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 3) {
      const quantityCell = cells[2]; // Third column should be Quantity
      const quantityText = quantityCell.textContent?.trim() || '';
      
      // Extract numeric quantity
      const quantityMatch = quantityText.match(/(\d+)/);
      const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 0;
      
      console.log(`Row ${index + 1} Quantity: "${quantityText}" -> ${quantity}`);
      
      if (quantity === 0 || isNaN(quantity)) {
        quantityIssues.push({
          row: index + 1,
          text: quantityText,
          quantity: quantity
        });
      }
    }
  });
  
  if (quantityIssues.length > 0) {
    console.log('❌ QUANTITY ISSUES FOUND:');
    quantityIssues.forEach(issue => {
      console.log(`  Row ${issue.row}: "${issue.text}" (parsed as ${issue.quantity})`);
    });
  } else {
    console.log('✅ All quantity values appear correct');
  }
  
  return quantityIssues.length === 0;
}

// Test function to check Status column
function testStatusColumn() {
  console.log('\n🏷️  CHECKING STATUS COLUMN...');
  
  const table = document.querySelector('table');
  if (!table) return false;
  
  const tbody = table.querySelector('tbody');
  const rows = tbody ? tbody.querySelectorAll('tr') : [];
  
  let statusIssues = [];
  
  rows.forEach((row, index) => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 4) {
      const statusCell = cells[3]; // Fourth column should be Status
      const statusText = statusCell.textContent?.trim() || '';
      
      console.log(`Row ${index + 1} Status: "${statusText}"`);
      
      // Check for valid status values
      const validStatuses = ['In Stock', 'Low Stock', 'Out of Stock'];
      const hasValidStatus = validStatuses.some(status => statusText.includes(status));
      
      if (!hasValidStatus) {
        statusIssues.push({
          row: index + 1,
          text: statusText
        });
      }
    }
  });
  
  if (statusIssues.length > 0) {
    console.log('❌ STATUS ISSUES FOUND:');
    statusIssues.forEach(issue => {
      console.log(`  Row ${issue.row}: "${issue.text}"`);
    });
  } else {
    console.log('✅ All status values appear correct');
  }
  
  return statusIssues.length === 0;
}

// Test function to check Transactions column
function testTransactionsColumn() {
  console.log('\n💰 CHECKING TRANSACTIONS COLUMN...');
  
  const table = document.querySelector('table');
  if (!table) return false;
  
  const tbody = table.querySelector('tbody');
  const rows = tbody ? tbody.querySelectorAll('tr') : [];
  
  let transactionIssues = [];
  
  rows.forEach((row, index) => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 5) {
      const transactionsCell = cells[4]; // Fifth column should be Transactions
      const transactionsText = transactionsCell.textContent?.trim() || '';
      
      console.log(`Row ${index + 1} Transactions: "${transactionsText}"`);
      
      // Check if it's a number
      const transactionCount = parseInt(transactionsText);
      if (isNaN(transactionCount) || transactionCount < 0) {
        transactionIssues.push({
          row: index + 1,
          text: transactionsText,
          count: transactionCount
        });
      }
    }
  });
  
  if (transactionIssues.length > 0) {
    console.log('❌ TRANSACTIONS ISSUES FOUND:');
    transactionIssues.forEach(issue => {
      console.log(`  Row ${issue.row}: "${issue.text}" (parsed as ${issue.count})`);
    });
  } else {
    console.log('✅ All transaction counts appear correct');
  }
  
  return transactionIssues.length === 0;
}

// Test function to check update modal
function testUpdateModal() {
  console.log('\n🔄 TESTING UPDATE MODAL...');
  
  // Find update button in first row
  const table = document.querySelector('table');
  if (!table) {
    console.log('❌ Table not found for modal test');
    return false;
  }
  
  const tbody = table.querySelector('tbody');
  const firstRow = tbody ? tbody.querySelector('tr') : null;
  
  if (!firstRow) {
    console.log('❌ No rows found for modal test');
    return false;
  }
  
  // Find update button
  const updateButton = firstRow.querySelector('button');
  if (!updateButton) {
    console.log('❌ Update button not found');
    return false;
  }
  
  console.log('✅ Update button found, clicking to test modal...');
  
  // Click update button
  updateButton.click();
  
  // Wait for modal to appear
  setTimeout(() => {
    const modal = document.querySelector('[class*="fixed inset-0"]');
    if (!modal) {
      console.log('❌ Update modal did not appear');
      return;
    }
    
    console.log('✅ Update modal appeared');
    
    // Check modal content
    const modalTitle = modal.querySelector('h3');
    const currentQuantityDiv = modal.querySelector('.text-xl');
    const quantityInput = modal.querySelector('input[name="quantityChange"]');
    const reasonTextarea = modal.querySelector('textarea[name="reason"]');
    
    console.log('\n📋 MODAL CONTENT CHECK:');
    console.log(`- Title: ${modalTitle ? modalTitle.textContent : 'Not found'}`);
    console.log(`- Current quantity display: ${currentQuantityDiv ? currentQuantityDiv.textContent : 'Not found'}`);
    console.log(`- Quantity input exists: ${quantityInput ? '✅' : '❌'}`);
    console.log(`- Reason textarea exists: ${reasonTextarea ? '✅' : '❌'}`);
    
    if (quantityInput) {
      console.log(`- Quantity input value: "${quantityInput.value}"`);
      console.log(`- Quantity input placeholder: "${quantityInput.placeholder}"`);
    }
    
    if (reasonTextarea) {
      console.log(`- Reason textarea value: "${reasonTextarea.value}"`);
      console.log(`- Reason textarea rows: ${reasonTextarea.getAttribute('rows')}`);
    }
    
    // Check for hardcoded values
    const hardcodedValues = [];
    
    if (currentQuantityDiv && currentQuantityDiv.textContent.includes('50')) {
      hardcodedValues.push('Current quantity shows 50 (hardcoded)');
    }
    
    if (quantityInput && quantityInput.placeholder.includes('hardcoded')) {
      hardcodedValues.push('Placeholder contains hardcoded text');
    }
    
    if (hardcodedValues.length > 0) {
      console.log('\n❌ HARDCODED VALUES DETECTED:');
      hardcodedValues.forEach(value => console.log(`  - ${value}`));
    } else {
      console.log('\n✅ No obvious hardcoded values detected');
    }
    
    // Close modal
    const closeButton = modal.querySelector('button[class*="bg-gray"]');
    if (closeButton) {
      setTimeout(() => {
        closeButton.click();
        console.log('✅ Modal closed');
      }, 2000);
    }
  }, 1000);
  
  return true;
}

// Main test runner
function runInventoryDiagnostics() {
  console.log('🚀 STARTING INVENTORY DIAGNOSTICS...\n');
  
  const tableTest = testInventoryTableData();
  const quantityTest = testQuantityColumn();
  const statusTest = testStatusColumn();
  const transactionsTest = testTransactionsColumn();
  
  console.log('\n📋 DIAGNOSTIC SUMMARY:');
  console.log(`Table structure: ${tableTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Quantity column: ${quantityTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Status column: ${statusTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Transactions column: ${transactionsTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (quantityTest && statusTest && transactionsTest) {
    console.log('\n🎉 ALL TABLE COLUMNS APPEAR CORRECT!');
    console.log('💡 If you still see issues, check the API response data');
    console.log('📊 Check browser console for "🔍 Inventory API Response" logs');
  } else {
    console.log('\n⚠️  SOME COLUMN ISSUES DETECTED');
    console.log('💡 Check the specific test results above for details');
  }
}

// Test update modal separately
function runModalTest() {
  console.log('🚀 TESTING UPDATE MODAL...\n');
  testUpdateModal();
}

// Instructions
console.log('\n📝 HOW TO USE:');
console.log('1. Go to Inventory Items page');
console.log('2. Run runInventoryDiagnostics() to test table columns');
console.log('3. Run runModalTest() to test update modal');
console.log('4. Check browser console for API response logs');

// Auto-run if on inventory page
const table = document.querySelector('table');
if (table) {
  console.log('\n🚀 Inventory page found, running diagnostics...');
  runInventoryDiagnostics();
} else {
  console.log('\n⏳ Inventory page not found');
  console.log('💡 Navigate to Inventory Items page first');
}

// Make test functions available globally
window.runInventoryDiagnostics = runInventoryDiagnostics;
window.runModalTest = runModalTest;
window.testInventoryTableData = testInventoryTableData;
window.testQuantityColumn = testQuantityColumn;
window.testStatusColumn = testStatusColumn;
window.testTransactionsColumn = testTransactionsColumn;
window.testUpdateModal = testUpdateModal;
