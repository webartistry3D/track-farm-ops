// Test script for thousand number formatting in inventory form
// Run this in browser console on the inventory page

console.log('🔢 TESTING THOUSAND NUMBER FORMATTING');

// Test function to verify thousand formatting works
function testThousandFormatting() {
  console.log('\n🧪 TESTING THOUSAND NUMBER FORMATTING...');
  
  // Find the Add New Item form
  const addForm = document.querySelector('form');
  if (!addForm) {
    console.log('❌ Add New Item form not found');
    console.log('💡 Click "Add New Item" button first');
    return false;
  }
  
  // Find the quantity input field
  const quantityInput = addForm.querySelector('input[name="quantity"]');
  if (!quantityInput) {
    console.log('❌ Quantity input not found');
    return false;
  }
  
  console.log('✅ Quantity input found');
  
  // Test cases for thousand formatting
  const testCases = [
    { input: '1', expected: '1', description: 'Single digit' },
    { input: '12', expected: '12', description: 'Two digits' },
    { input: '123', expected: '123', description: 'Three digits' },
    { input: '1234', expected: '1,234', description: 'Four digits (first comma)' },
    { input: '12345', expected: '12,345', description: 'Five digits' },
    { input: '123456', expected: '123,456', description: 'Six digits' },
    { input: '1234567', expected: '1,234,567', description: 'Seven digits (second comma)' },
    { input: '12345678', expected: '12,345,678', description: 'Eight digits' },
    { input: '123456789', expected: '123,456,789', description: 'Nine digits' },
    { input: '1234567890', expected: '1,234,567,890', description: 'Ten digits (third comma)' },
    { input: '1234.56', expected: '1,234.56', description: 'With decimal' },
    { input: '12345.678', expected: '12,345.678', description: 'With longer decimal' }
  ];
  
  console.log('\n📋 TESTING FORMATTING CASES:');
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  testCases.forEach((testCase, index) => {
    console.log(`\nTest ${index + 1}: ${testCase.description}`);
    console.log(`  Input: "${testCase.input}"`);
    console.log(`  Expected: "${testCase.expected}"`);
    
    // Simulate typing the input
    quantityInput.value = testCase.input;
    quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Wait for React to update
    setTimeout(() => {
      const actualValue = quantityInput.value;
      console.log(`  Actual: "${actualValue}"`);
      
      if (actualValue === testCase.expected) {
        console.log(`  ✅ PASS`);
        passedTests++;
      } else {
        console.log(`  ❌ FAIL`);
      }
      
      // If this is the last test, show results
      if (index === testCases.length - 1) {
        setTimeout(() => {
          showFormattingResults(passedTests, totalTests);
        }, 100);
      }
    }, 100);
  });
  
  return true;
}

// Function to show test results
function showFormattingResults(passedTests, totalTests) {
  console.log('\n📊 THOUSAND FORMATTING TEST RESULTS:');
  console.log('=====================================');
  console.log(`Tests Passed: ${passedTests}/${totalTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL THOUSAND FORMATTING TESTS PASSED!');
    console.log('✅ Numbers are correctly formatted with commas');
    console.log('✅ Decimals are preserved');
    console.log('✅ Large numbers get proper comma placement');
    
    console.log('\n💡 MANUAL TESTING:');
    console.log('1. Try typing "1000" - should become "1,000"');
    console.log('2. Try typing "10000" - should become "10,000"');
    console.log('3. Try typing "1000000" - should become "1,000,000"');
    console.log('4. Try typing "1234.56" - should become "1,234.56"');
  } else {
    console.log('\n⚠️  SOME FORMATTING TESTS FAILED');
    console.log('💡 Check the individual test results above');
  }
  
  console.log('=====================================');
}

// Test function to verify form submission still works with formatted numbers
function testFormSubmissionWithFormatting() {
  console.log('\n🧪 TESTING FORM SUBMISSION WITH FORMATTING...');
  
  const addForm = document.querySelector('form');
  if (!addForm) {
    console.log('❌ Form not found');
    return false;
  }
  
  // Find all form inputs
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
  
  // Fill form with test data including formatted quantity
  const testData = {
    name: 'Test Formatting Item',
    type: 'CONSUMABLES',
    quantity: '12345', // Should format to 12,345
    unit: 'kg',
    description: 'Testing thousand formatting'
  };
  
  console.log('\n📝 FILLING FORM WITH TEST DATA:');
  console.log(`  Name: "${testData.name}"`);
  console.log(`  Type: "${testData.type}"`);
  console.log(`  Quantity (input): "${testData.quantity}"`);
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
    console.log(`  Quantity (formatted): "${formattedQuantity}"`);
    
    if (formattedQuantity === '12,345') {
      console.log('✅ Quantity formatting applied correctly');
      
      console.log('\n📤 TESTING SUBMISSION...');
      console.log('💡 Check browser console for submission debug logs');
      console.log('💡 The raw quantity should be parsed correctly despite formatting');
      
      // Note: Not actually submitting to avoid creating test items
      console.log('ℹ️  Form submission ready - check console logs for parsing details');
      
    } else {
      console.log('❌ Quantity formatting failed');
      console.log(`Expected "12,345", got "${formattedQuantity}"`);
    }
  }, 200);
  
  return true;
}

// Main test runner
function runThousandFormattingTests() {
  console.log('🚀 STARTING THOUSAND NUMBER FORMATTING TESTS');
  console.log('=====================================');
  
  const formattingTest = testThousandFormatting();
  const submissionTest = testFormSubmissionWithFormatting();
  
  console.log('\n📋 TEST SUMMARY:');
  console.log(`Formatting Tests: ${formattingTest ? '✅ STARTED' : '❌ FAILED'}`);
  console.log(`Submission Tests: ${submissionTest ? '✅ STARTED' : '❌ FAILED'}`);
  
  console.log('=====================================');
}

// Instructions
console.log('\n📝 HOW TO USE:');
console.log('1. Go to Inventory Items page');
console.log('2. Click "Add New Item" button');
console.log('3. Run runThousandFormattingTests() to test formatting');
console.log('4. Try typing numbers manually to see formatting in action');
console.log('5. Check browser console for detailed test results');

// Auto-run if form is found
const addForm = document.querySelector('form');
if (addForm) {
  console.log('\n🚀 Add New Item form found, running tests...');
  runThousandFormattingTests();
} else {
  console.log('\n⏳ Add New Item form not found');
  console.log('💡 Click "Add New Item" button first');
}

// Make test functions available globally
window.runThousandFormattingTests = runThousandFormattingTests;
window.testThousandFormatting = testThousandFormatting;
window.testFormSubmissionWithFormatting = testFormSubmissionWithFormatting;
window.showFormattingResults = showFormattingResults;
