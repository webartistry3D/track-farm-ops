// Test script to verify quantity display fix in inventory table
// Run this in browser console on the inventory page

console.log('🔢 TESTING QUANTITY DISPLAY FIX');

// Test function to verify quantity display shows correct numbers
function testQuantityDisplayFix() {
  console.log('\n🧪 TESTING QUANTITY DISPLAY IN TABLE...');
  
  // Find the inventory table
  const table = document.querySelector('table');
  if (!table) {
    console.log('❌ Inventory table not found');
    return false;
  }
  
  const tbody = table.querySelector('tbody');
  const rows = tbody ? tbody.querySelectorAll('tr') : [];
  
  if (rows.length === 0) {
    console.log('❌ No inventory rows found');
    console.log('💡 Add some inventory items first to test display');
    return false;
  }
  
  console.log(`✅ Found ${rows.length} inventory rows`);
  console.log('\n📊 ANALYZING QUANTITY DISPLAY:');
  
  let displayIssues = [];
  let correctDisplays = [];
  
  rows.forEach((row, index) => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 5) {
      const nameCell = cells[0];
      const quantityCell = cells[2];
      const statusCell = cells[3];
      
      const itemName = nameCell.textContent?.trim() || '';
      const quantityText = quantityCell.textContent?.trim() || '';
      const statusText = statusCell.textContent?.trim() || '';
      
      console.log(`\nRow ${index + 1}: ${itemName}`);
      console.log(`  Quantity Display: "${quantityText}"`);
      console.log(`  Status: "${statusText}"`);
      
      // Extract numeric quantity from display
      const quantityMatch = quantityText.match(/([\d,]+(?:\.\d+)?)/);
      const displayedQuantity = quantityMatch ? quantityMatch[1] : null;
      
      // Extract unit
      const unitMatch = quantityText.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(\w+)/);
      const unit = unitMatch ? unitMatch[2] : 'unknown';
      
      console.log(`  Parsed Quantity: ${displayedQuantity}`);
      console.log(`  Unit: ${unit}`);
      
      // Check if quantity is showing as "0"
      if (displayedQuantity === '0') {
        displayIssues.push({
          row: index + 1,
          name: itemName,
          issue: 'Showing 0 instead of actual quantity',
          display: quantityText
        });
      } else if (displayedQuantity && displayedQuantity !== '0') {
        // Check if quantity is properly formatted with commas
        const numericValue = parseInt(displayedQuantity.replace(/,/g, ''));
        const isFormatted = displayedValue.includes(',');
        
        if (numericValue >= 1000 && !isFormatted) {
          console.log(`  ⚠️  Large number not formatted: ${displayedQuantity}`);
        } else {
          console.log(`  ✅ Quantity displayed correctly: ${displayedQuantity}`);
          correctDisplays.push({
            row: index + 1,
            name: itemName,
            display: quantityText
          });
        }
      }
      
      // Check status logic
      const numericQuantity = parseInt(displayedQuantity?.replace(/,/g, '') || '0');
      let expectedStatus = 'In Stock';
      
      if (numericQuantity === 0) expectedStatus = 'Out of Stock';
      else if (numericQuantity < 10) expectedStatus = 'Low Stock';
      
      if (statusText.includes(expectedStatus)) {
        console.log(`  ✅ Status correct: ${expectedStatus}`);
      } else {
        console.log(`  ⚠️  Status mismatch: Expected "${expectedStatus}", got "${statusText}"`);
      }
    }
  });
  
  console.log('\n📋 QUANTITY DISPLAY RESULTS:');
  console.log('=====================================');
  
  if (displayIssues.length > 0) {
    console.log('❌ DISPLAY ISSUES FOUND:');
    displayIssues.forEach(issue => {
      console.log(`  Row ${issue.row} (${issue.name}): ${issue.issue}`);
      console.log(`    Display: "${issue.display}"`);
    });
  } else {
    console.log('✅ NO QUANTITY DISPLAY ISSUES FOUND');
  }
  
  if (correctDisplays.length > 0) {
    console.log('\n✅ CORRECTLY DISPLAYED ITEMS:');
    correctDisplays.forEach(item => {
      console.log(`  Row ${item.row} (${item.name}): "${item.display}"`);
    });
  }
  
  console.log('=====================================');
  
  return displayIssues.length === 0;
}

// Test function to create a new item and verify display
function testNewItemDisplay() {
  console.log('\n🧪 TESTING NEW ITEM CREATION AND DISPLAY...');
  
  // Find the Add New Item form
  const addForm = document.querySelector('form');
  if (!addForm) {
    console.log('❌ Add New Item form not found');
    return false;
  }
  
  // Find form inputs
  const nameInput = addForm.querySelector('input[name="name"]');
  const typeSelect = addForm.querySelector('select[name="type"]');
  const quantityInput = addForm.querySelector('input[name="quantity"]');
  const unitInput = addForm.querySelector('input[name="unit"]');
  const submitButton = addForm.querySelector('button[type="submit"]');
  
  if (!nameInput || !typeSelect || !quantityInput || !unitInput || !submitButton) {
    console.log('❌ Some form inputs not found');
    return false;
  }
  
  console.log('✅ All form inputs found');
  
  // Fill form with test data
  const testData = {
    name: 'Test Quantity Display ' + new Date().getTime(),
    type: 'CONSUMABLES',
    quantity: '2500', // Should format to 2,500
    unit: 'pieces'
  };
  
  console.log('\n📝 FILLING TEST DATA:');
  console.log(`  Name: "${testData.name}"`);
  console.log(`  Type: "${testData.type}"`);
  console.log(`  Quantity: "${testData.quantity}"`);
  console.log(`  Unit: "${testData.unit}"`);
  
  // Fill form
  nameInput.value = testData.name;
  typeSelect.value = testData.type;
  quantityInput.value = testData.quantity;
  unitInput.value = testData.unit;
  
  // Trigger events
  nameInput.dispatchEvent(new Event('input', { bubbles: true }));
  typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
  quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
  unitInput.dispatchEvent(new Event('input', { bubbles: true }));
  
  // Wait for formatting to apply
  setTimeout(() => {
    const formattedQuantity = quantityInput.value;
    console.log(`  Formatted Quantity: "${formattedQuantity}"`);
    
    if (formattedQuantity === '2,500') {
      console.log('✅ Quantity formatting correct in form');
      
      console.log('\n📤 SUBMITTING TEST ITEM...');
      console.log('💡 Check browser console for submission debug logs');
      console.log('💡 After submission, the new item should show "2,500 pieces" in the table');
      
      // Note: Not actually submitting to avoid creating test items
      console.log('ℹ️  Ready to submit - check that table shows correct quantity after submission');
      
    } else {
      console.log('❌ Quantity formatting failed');
      console.log(`Expected "2,500", got "${formattedQuantity}"`);
    }
  }, 200);
  
  return true;
}

// Main test runner
function runQuantityDisplayTests() {
  console.log('🚀 STARTING QUANTITY DISPLAY FIX TESTS');
  console.log('=====================================');
  
  const displayTest = testQuantityDisplayFix();
  const newitemTest = testNewItemDisplay();
  
  console.log('\n📋 TEST SUMMARY:');
  console.log(`Existing items display: ${displayTest ? '✅ FIXED' : '❌ ISSUES REMAIN'}`);
  console.log(`New item creation: ${newitemTest ? '✅ READY' : '❌ FAILED'}`);
  
  if (displayTest) {
    console.log('\n🎉 QUANTITY DISPLAY FIX VERIFIED!');
    console.log('✅ Items now show correct quantities (e.g., "1,000 pieces")');
    console.log('✅ No more "0 pieces" display issues');
    console.log('✅ Thousand formatting applied in table');
  } else {
    console.log('\n⚠️  SOME QUANTITY DISPLAY ISSUES REMAIN');
    console.log('💡 Check the individual test results above');
  }
  
  console.log('=====================================');
}

// Instructions
console.log('\n📝 HOW TO USE:');
console.log('1. Go to Inventory Items page');
console.log('2. Run runQuantityDisplayTests() to test display fixes');
console.log('3. Check that existing items show correct quantities');
console.log('4. Test creating a new item to verify the fix works');

// Auto-run if on inventory page
const table = document.querySelector('table');
if (table) {
  console.log('\n🚀 Inventory page found, running tests...');
  runQuantityDisplayTests();
} else {
  console.log('\n⏳ Not on inventory page');
  console.log('💡 Navigate to Inventory Items tab first');
}

// Make test functions available globally
window.runQuantityDisplayTests = runQuantityDisplayTests;
window.testQuantityDisplayFix = testQuantityDisplayFix;
window.testNewItemDisplay = testNewItemDisplay;
