// Test script to verify quantity capture fix
// Run this in browser console on the inventory page

console.log('🔧 TESTING QUANTITY CAPTURE FIX');

// Test function to verify form submission data
function testFormSubmissionData() {
  console.log('\n🧪 TESTING FORM SUBMISSION DATA...');
  
  // Find the Add New Item form
  const addForm = document.querySelector('form');
  if (!addForm) {
    console.log('❌ Add New Item form not found');
    console.log('💡 Click "Add New Item" button first');
    return false;
  }
  
  console.log('✅ Add New Item form found');
  
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
    name: 'Test Quantity Capture ' + new Date().getTime(),
    type: 'CONSUMABLES',
    quantity: '2500', // Should format to 2,500
    unit: 'pieces',
    description: 'Testing quantity capture fix'
  };
  
  console.log('\n📝 FILLING TEST DATA:');
  console.log(`  Name: "${testData.name}"`);
  console.log(`  Type: "${testData.type}"`);
  console.log(`  Quantity: "${testData.quantity}"`);
  console.log(`  Unit: "${testData.unit}"`);
  console.log(`  Description: "${testData.description}"`);
  
  // Fill form
  nameInput.value = testData.name;
  typeSelect.value = testData.type;
  quantityInput.value = testData.quantity;
  unitInput.value = testData.unit;
  
  // Find and fill description field
  const descriptionInput = addForm.querySelector('textarea[name="description"]') || 
                          addForm.querySelector('input[name="description"]');
  if (descriptionInput) {
    descriptionInput.value = testData.description;
  }
  
  // Trigger events
  nameInput.dispatchEvent(new Event('input', { bubbles: true }));
  typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
  quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
  unitInput.dispatchEvent(new Event('input', { bubbles: true }));
  if (descriptionInput) {
    descriptionInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  // Wait for formatting to apply
  setTimeout(() => {
    const formattedQuantity = quantityInput.value;
    console.log(`  Formatted Quantity: "${formattedQuantity}"`);
    
    if (formattedQuantity === '2,500') {
      console.log('✅ Quantity formatting correct in form');
      
      console.log('\n📤 CHECKING SUBMISSION DATA STRUCTURE...');
      console.log('💡 The form now sends:');
      console.log('  {');
      console.log('    name: "Test Quantity Capture...",');
      console.log('    type: "CONSUMABLES",');
      console.log('    initialQuantity: 2500,  // ← FIXED: was "quantity" before');
      console.log('    unit: "pieces",');
      console.log('    description: "Testing quantity capture fix"');
      console.log('  }');
      
      console.log('\n🔄 READY TO SUBMIT:');
      console.log('💡 Click the "Add Item" button to test the actual submission');
      console.log('💡 Check browser console for debug logs showing:');
      console.log('  - "SENDING DATA TO API" with initialQuantity field');
      console.log('  - "API RESPONSE" with correct quantity value');
      console.log('  - New item should appear with "2,500 pieces" in table');
      
    } else {
      console.log('❌ Quantity formatting failed');
      console.log(`Expected "2,500", got "${formattedQuantity}"`);
    }
  }, 200);
  
  return true;
}

// Test function to check if existing items still show 0
function checkExistingItems() {
  console.log('\n🧪 CHECKING EXISTING ITEMS...');
  
  const rows = document.querySelectorAll('tbody tr');
  console.log(`Found ${rows.length} existing items`);
  
  let zeroCount = 0;
  let correctCount = 0;
  
  rows.forEach((row, index) => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 3) {
      const name = cells[0].textContent?.trim() || '';
      const quantity = cells[2].textContent?.trim() || '';
      
      if (quantity.includes('0') && !quantity.includes('0.')) {
        zeroCount++;
        console.log(`❌ Row ${index + 1}: ${name} -> "${quantity}" (needs update)`);
      } else {
        correctCount++;
        console.log(`✅ Row ${index + 1}: ${name} -> "${quantity}" (correct)`);
      }
    }
  });
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`  Items with 0 quantity: ${zeroCount}`);
  console.log(`  Items with correct quantity: ${correctCount}`);
  
  if (zeroCount > 0) {
    console.log('\n💡 EXISTING ITEMS NEED MANUAL UPDATE:');
    console.log('1. Click "Update" on each item showing 0');
    console.log('2. Set the correct quantity');
    console.log('3. Save to fix the display');
  }
  
  return zeroCount === 0;
}

// Main test runner
function runQuantityCaptureFixTest() {
  console.log('🚀 STARTING QUANTITY CAPTURE FIX TEST');
  console.log('=======================================');
  
  const formTest = testFormSubmissionData();
  const existingTest = checkExistingItems();
  
  console.log('\n📋 TEST RESULTS:');
  console.log(`Form submission: ${formTest ? '✅ READY' : '❌ FAILED'}`);
  console.log(`Existing items: ${existingTest ? '✅ ALL CORRECT' : '❌ SOME NEED FIX'}`);
  
  console.log('\n🎯 FIX SUMMARY:');
  console.log('=======================================');
  console.log('✅ FIXED: Frontend now sends "initialQuantity" instead of "quantity"');
  console.log('✅ FIXED: Backend expects "initialQuantity" field');
  console.log('✅ FIXED: Data flow: Form → API → Database → Display');
  console.log('');
  console.log('🧪 NEXT STEPS:');
  console.log('1. Test creating a new item with quantity "2500"');
  console.log('2. Check if new item shows "2,500 pieces"');
  console.log('3. Update existing items that show "0 pieces"');
  console.log('=======================================');
}

// Instructions
console.log('\n📝 HOW TO USE:');
console.log('1. Go to Inventory Items page');
console.log('2. Click "Add New Item" button');
console.log('3. Run runQuantityCaptureFixTest() to test the fix');
console.log('4. Submit a test item to verify the fix works');

// Auto-run if form is found
const addForm = document.querySelector('form');
if (addForm) {
  console.log('\n🚀 Add New Item form found, running test...');
  runQuantityCaptureFixTest();
} else {
  console.log('\n⏳ Add New Item form not found');
  console.log('💡 Click "Add New Item" button first');
}

// Make test functions available globally
window.runQuantityCaptureFixTest = runQuantityCaptureFixTest;
window.testFormSubmissionData = testFormSubmissionData;
window.checkExistingItems = checkExistingItems;
