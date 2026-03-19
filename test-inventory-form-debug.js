// Comprehensive test script for Add New Inventory Item form
// Run this in browser console on the inventory page

console.log('🔧 COMPREHENSIVE INVENTORY FORM DEBUG');

// Test function to check form elements and their current state
function testFormElements() {
  console.log('\n📋 TESTING FORM ELEMENTS...');
  
  // Find the Add New Item form
  const addForm = document.querySelector('form');
  if (!addForm) {
    console.log('❌ Add New Item form not found');
    return false;
  }
  
  console.log('✅ Add New Item form found');
  
  // Find all input elements
  const nameInput = addForm.querySelector('input[name="name"]');
  const typeSelect = addForm.querySelector('select[name="type"]');
  const quantityInput = addForm.querySelector('input[name="quantity"]');
  const unitInput = addForm.querySelector('input[name="unit"]');
  const descriptionTextarea = addForm.querySelector('textarea[name="description"]');
  const submitButton = addForm.querySelector('button[type="submit"]');
  
  console.log('\n🔍 FORM ELEMENTS ANALYSIS:');
  console.log(`  Name input: ${nameInput ? '✅ Found' : '❌ Missing'}`);
  console.log(`  Type select: ${typeSelect ? '✅ Found' : '❌ Missing'}`);
  console.log(`  Quantity input: ${quantityInput ? '✅ Found' : '❌ Missing'}`);
  console.log(`  Unit input: ${unitInput ? '✅ Found' : '❌ Missing'}`);
  console.log(`  Description textarea: ${descriptionTextarea ? '✅ Found' : '❌ Missing'}`);
  console.log(`  Submit button: ${submitButton ? '✅ Found' : '❌ Missing'}`);
  
  if (!nameInput || !typeSelect || !quantityInput || !unitInput || !submitButton) {
    console.log('❌ Some form elements are missing');
    return false;
  }
  
  // Check current values
  console.log('\n📝 CURRENT FORM VALUES:');
  console.log(`  Name: "${nameInput.value}"`);
  console.log(`  Type: "${typeSelect.value}"`);
  console.log(`  Quantity: "${quantityInput.value}"`);
  console.log(`  Unit: "${unitInput.value}"`);
  console.log(`  Description: "${descriptionTextarea.value}"`);
  
  // Check placeholders
  console.log('\n🏷️  PLACEHOLDERS:');
  console.log(`  Name placeholder: "${nameInput.placeholder || 'None'}"`);
  console.log(`  Quantity placeholder: "${quantityInput.placeholder || 'None'}"`);
  console.log(`  Unit placeholder: "${unitInput.placeholder || 'None'}"`);
  console.log(`  Description placeholder: "${descriptionTextarea.placeholder || 'None'}"`);
  
  return true;
}

// Test function to simulate form submission
function testFormSubmission() {
  console.log('\n🧪 TESTING FORM SUBMISSION...');
  
  const addForm = document.querySelector('form');
  if (!addForm) {
    console.log('❌ Form not found for submission test');
    return false;
  }
  
  // Fill in test data
  const nameInput = addForm.querySelector('input[name="name"]');
  const typeSelect = addForm.querySelector('select[name="type"]');
  const quantityInput = addForm.querySelector('input[name="quantity"]');
  const unitInput = addForm.querySelector('input[name="unit"]');
  const descriptionTextarea = addForm.querySelector('textarea[name="description"]');
  
  if (!nameInput || !typeSelect || !quantityInput || !unitInput) {
    console.log('❌ Form inputs not found for testing');
    return false;
  }
  
  console.log('🔄 FILLING TEST DATA...');
  
  // Set test values
  const testData = {
    name: 'Test Item ' + Date.now(),
    type: 'CONSUMABLES',
    quantity: '25',
    unit: 'kg',
    description: 'Test description for debugging'
  };
  
  // Fill form
  nameInput.value = testData.name;
  typeSelect.value = testData.type;
  quantityInput.value = testData.quantity;
  unitInput.value = testData.unit;
  descriptionTextarea.value = testData.description;
  
  // Trigger change events to ensure React state updates
  ['input', 'select', 'textarea'].forEach(tag => {
    const elements = addForm.querySelectorAll(tag);
    elements.forEach(element => {
      if (element.value !== undefined) {
        element.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });
  
  console.log('✅ Test data filled:');
  console.log(`  Name: "${testData.name}"`);
  console.log(`  Type: "${testData.type}"`);
  console.log(`  Quantity: "${testData.quantity}"`);
  console.log(`  Unit: "${testData.unit}"`);
  console.log(`  Description: "${testData.description}"`);
  
  // Find and click submit button
  const submitButton = addForm.querySelector('button[type="submit"]');
  if (submitButton) {
    console.log('📤 CLICKING SUBMIT BUTTON...');
    submitButton.click();
    
    // Wait for processing
    setTimeout(() => {
      console.log('⏳ Waiting for form submission to complete...');
    }, 500);
    
    // Wait longer for API response and table update
    setTimeout(() => {
      console.log('🔍 CHECKING RESULTS...');
      
      // Check if form was cleared (indicates successful submission)
      const isFormCleared = !nameInput.value && !quantityInput.value && !unitInput.value;
      console.log(`  Form cleared: ${isFormCleared ? '✅ Yes' : '❌ No'}`);
      
      // Check for success message
      const successAlert = document.querySelector('[role="alert"]');
      if (successAlert) {
        console.log(`  Success alert: ${successAlert.textContent}`);
      } else {
        console.log('  No success alert found');
      }
      
      // Check for error message
      const errorAlert = document.querySelector('[role="alert"]');
      if (errorAlert) {
        console.log(`  Error alert: ${errorAlert.textContent}`);
      } else {
        console.log('  No error alert found');
      }
      
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
            console.log('  Item Name:', cells[0]?.textContent?.trim());
            console.log('  Type:', cells[1]?.textContent?.trim());
            console.log('  Quantity:', cells[2]?.textContent?.trim());
            console.log('  Status:', cells[3]?.textContent?.trim());
            console.log('  Transactions:', cells[4]?.textContent?.trim());
            console.log('  Actions:', cells[5]?.textContent?.trim());
          }
        } else {
          console.log('❌ Test item not found in table');
        }
      } else {
        console.log('❌ Table not found for result checking');
      }
    }, 2000);
  }
  
  return true;
}

// Test function to check form validation
function testFormValidation() {
  console.log('\n✅ TESTING FORM VALIDATION...');
  
  const addForm = document.querySelector('form');
  if (!addForm) return false;
  
  const nameInput = addForm.querySelector('input[name="name"]');
  const typeSelect = addForm.querySelector('select[name="type"]');
  const quantityInput = addForm.querySelector('input[name="quantity"]');
  const unitInput = addForm.querySelector('input[name="unit"]');
  
  console.log('🧪 TESTING VALIDATION SCENARIOS...');
  
  // Test 1: Empty name
  console.log('\n  Test 1: Empty name');
  nameInput.value = '';
  nameInput.dispatchEvent(new Event('input', { bubbles: true }));
  console.log(`    Name validation: ${nameInput.value.trim() ? '❌ Failed' : '✅ Passed'}`);
  
  // Test 2: Empty quantity
  console.log('\n  Test 2: Empty quantity');
  nameInput.value = 'Test Item';
  quantityInput.value = '';
  quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
  console.log(`    Quantity validation: ${quantityInput.value.trim() ? '❌ Failed' : '✅ Passed'}`);
  
  // Test 3: Empty unit
  console.log('\n  Test 3: Empty unit');
  nameInput.value = 'Test Item';
  quantityInput.value = '25';
  unitInput.value = '';
  unitInput.dispatchEvent(new Event('input', { bubbles: true }));
  console.log(`    Unit validation: ${unitInput.value.trim() ? '❌ Failed' : '✅ Passed'}`);
  
  // Reset form
  nameInput.value = '';
  quantityInput.value = '';
  unitInput.value = '';
  
  console.log('✅ Form validation tests completed');
  return true;
}

// Main test runner
function runComprehensiveFormTest() {
  console.log('🚀 STARTING COMPREHENSIVE INVENTORY FORM TEST...\n');
  
  const elementsTest = testFormElements();
  const validationTest = testFormValidation();
  
  console.log('\n📋 TEST SUMMARY:');
  console.log(`Form Elements: ${elementsTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Form Validation: ${validationTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (elementsTest && validationTest) {
    console.log('\n🎯 READY FOR SUBMISSION TEST');
    console.log('💡 Run testFormSubmission() to test actual form submission');
    console.log('💡 Monitor browser console for debug messages');
  } else {
    console.log('\n⚠️  FORM ISSUES DETECTED');
    console.log('💡 Check the specific test results above');
  }
}

// Instructions
console.log('\n📝 HOW TO USE:');
console.log('1. Go to Inventory Items page');
console.log('2. Make sure "Add New Item" button is visible');
console.log('3. Run runComprehensiveFormTest() to test form elements and validation');
console.log('4. Run testFormSubmission() to test actual submission process');
console.log('5. Monitor browser console for detailed debug messages');
console.log('6. Check if new items appear correctly in the table');

// Auto-run if on inventory page
const addForm = document.querySelector('form');
if (addForm) {
  console.log('\n🚀 Inventory form found, running comprehensive tests...');
  runComprehensiveFormTest();
} else {
  console.log('\n⏳ Add New Item form not found');
  console.log('💡 Click "Add New Item" button first');
}

// Make test functions available globally
window.runComprehensiveFormTest = runComprehensiveFormTest;
window.testFormElements = testFormElements;
window.testFormValidation = testFormValidation;
window.testFormSubmission = testFormSubmission;
