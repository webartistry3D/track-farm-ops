// Simple direct test for inventory form issues
// Run this in browser console on the inventory page

console.log('🔧 SIMPLE INVENTORY FORM TEST');

// Direct test without function dependencies
console.log('🚀 STARTING INVENTORY FORM ANALYSIS...');

// Test 1: Check if form exists
const addForm = document.querySelector('form');
if (!addForm) {
  console.log('❌ Add New Item form not found');
  console.log('💡 Click "Add New Item" button first');
} else {
  console.log('✅ Add New Item form found');
  
  // Test 2: Check form inputs
  const nameInput = addForm.querySelector('input[name="name"]');
  const typeSelect = addForm.querySelector('select[name="type"]');
  const quantityInput = addForm.querySelector('input[name="quantity"]');
  const unitInput = addForm.querySelector('input[name="unit"]');
  const submitButton = addForm.querySelector('button[type="submit"]');
  
  console.log('\n📋 FORM INPUTS CHECK:');
  console.log(`  Name input: ${nameInput ? '✅' : '❌'}`);
  console.log(`  Type select: ${typeSelect ? '✅' : '❌'}`);
  console.log(`  Quantity input: ${quantityInput ? '✅' : '❌'}`);
  console.log(`  Unit input: ${unitInput ? '✅' : '❌'}`);
  console.log(`  Submit button: ${submitButton ? '✅' : '❌'}`);
  
  if (nameInput && typeSelect && quantityInput && unitInput && submitButton) {
    console.log('\n📝 CURRENT VALUES:');
    console.log(`  Name: "${nameInput.value}"`);
    console.log(`  Type: "${typeSelect.value}"`);
    console.log(`  Quantity: "${quantityInput.value}"`);
    console.log(`  Unit: "${unitInput.value}"`);
    
    // Test 3: Fill in test data and submit
    console.log('\n🧪 TESTING FORM SUBMISSION...');
    
    // Fill test data
    const testData = {
      name: 'Debug Item ' + new Date().getTime(),
      type: 'CONSUMABLES',
      quantity: '42',
      unit: 'kg'
    };
    
    // Set form values
    nameInput.value = testData.name;
    typeSelect.value = testData.type;
    quantityInput.value = testData.quantity;
    unitInput.value = testData.unit;
    
    // Trigger React state updates
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
    unitInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    console.log('✅ Test data filled:');
    console.log(`  Name: "${testData.name}"`);
    console.log(`  Type: "${testData.type}"`);
    console.log(`  Quantity: "${testData.quantity}"`);
    console.log(`  Unit: "${testData.unit}"`);
    
    // Submit form
    console.log('📤 CLICKING SUBMIT BUTTON...');
    submitButton.click();
    
    // Wait for results
    setTimeout(() => {
      console.log('\n🔍 CHECKING SUBMISSION RESULTS...');
      
      // Check for success/error alerts
      const alerts = document.querySelectorAll('[role="alert"]');
      if (alerts.length > 0) {
        alerts.forEach(alert => {
          console.log(`  Alert: ${alert.textContent}`);
        });
      } else {
        console.log('  No alerts found');
      }
      
      // Check if form was cleared
      const isFormCleared = !nameInput.value && !quantityInput.value && !unitInput.value;
      console.log(`  Form cleared: ${isFormCleared ? '✅' : '❌'}`);
      
      // Check table for new item
      const table = document.querySelector('table');
      if (table) {
        const tbody = table.querySelector('tbody');
        const rows = tbody ? tbody.querySelectorAll('tr') : [];
        console.log(`  Table rows after submission: ${rows.length}`);
        
        // Look for our test item
        const testItemRow = Array.from(rows).find(row => {
          const nameCell = row.querySelector('td');
          return nameCell && nameCell.textContent && nameCell.textContent.includes(testData.name);
        });
        
        if (testItemRow) {
          console.log('✅ Test item found in table');
          
          const cells = testItemRow.querySelectorAll('td');
          if (cells.length >= 5) {
            console.log('  📋 TEST ITEM DATA:');
            console.log(`    Name: "${cells[0]?.textContent?.trim()}"`);
            console.log(`    Type: "${cells[1]?.textContent?.trim()}"`);
            console.log(`    Quantity: "${cells[2]?.textContent?.trim()}"`);
            console.log(`    Status: "${cells[3]?.textContent?.trim()}"`);
            console.log(`    Transactions: "${cells[4]?.textContent?.trim()}"`);
            
            // Check for data issues
            const quantityText = cells[2]?.textContent?.trim() || '';
            const quantityMatch = quantityText.match(/(\d+)/);
            const quantity = quantityMatch ? parseInt(quantityMatch[1]) : null;
            
            if (quantity !== 42) {
              console.log(`    ❌ QUANTITY ISSUE: Expected 42, got ${quantity}`);
            } else {
              console.log(`    ✅ Quantity correct: ${quantity}`);
            }
            
            const statusText = cells[3]?.textContent?.trim() || '';
            const validStatuses = ['In Stock', 'Low Stock', 'Out of Stock'];
            const hasValidStatus = validStatuses.some(status => statusText.includes(status));
            
            if (!hasValidStatus) {
              console.log(`    ❌ STATUS ISSUE: "${statusText}" is not valid`);
            } else {
              console.log(`    ✅ Status valid: "${statusText}"`);
            }
            
            const transactionsText = cells[4]?.textContent?.trim() || '';
            const transactionCount = parseInt(transactionsText);
            
            if (isNaN(transactionCount) || transactionCount < 0) {
              console.log(`    ❌ TRANSACTIONS ISSUE: "${transactionsText}" is not valid`);
            } else {
              console.log(`    ✅ Transactions valid: ${transactionCount}`);
            }
          }
        } else {
          console.log('❌ Test item not found in table');
        }
      } else {
        console.log('❌ Table not found for result checking');
      }
    }, 2000);
    
    // Check for console errors
    setTimeout(() => {
      console.log('\n🔍 CHECKING BROWSER CONSOLE FOR ERRORS...');
      console.log('💡 Look for any red error messages in the console');
      console.log('💡 Check network tab for failed API requests');
      console.log('💡 The form debugging should show detailed submission logs');
    }, 2500);
  } else {
    console.log('❌ Some form inputs are missing');
  }
} else {
  console.log('❌ Could not locate inventory page');
}

console.log('\n📝 INSTRUCTIONS:');
console.log('1. Go to Inventory Items page');
console.log('2. Make sure "Add New Item" button is visible');
console.log('3. Paste this entire script in browser console');
console.log('4. The test will automatically:');
console.log('   - Check form elements');
console.log('   - Fill with test data');
console.log('   - Submit form');
console.log('   - Check results in table');
console.log('   - Look for console errors');
console.log('5. Any issues will be clearly identified');
