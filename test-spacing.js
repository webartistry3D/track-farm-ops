// Test script to verify spacing is now consistent
// Run this in browser console after refreshing

console.log('📏 TESTING SPACING CONSISTENCY');

// Find the main form containers
const recordIncomeForm = document.querySelector('form.space-y-4');
const createInvoiceForm = document.querySelector('form.space-y-4');

if (!recordIncomeForm || !createInvoiceForm) {
  console.log('❌ Could not find both forms');
} else {
  console.log('✅ Both forms found');
  
  // Get first input field from each form
  const recordIncomeInput = recordIncomeForm.querySelector('input');
  const createInvoiceInput = createInvoiceForm.querySelector('input');
  
  if (recordIncomeInput && createInvoiceInput) {
    // Calculate distance from form edge to first input
    const recordRect = recordIncomeForm.getBoundingClientRect();
    const inputRecordRect = recordIncomeInput.getBoundingClientRect();
    const recordDistance = inputRecordRect.top - recordRect.top;
    
    const createRect = createInvoiceForm.getBoundingClientRect();
    const inputCreateRect = createInvoiceInput.getBoundingClientRect();
    const createDistance = inputCreateRect.top - createRect.top;
    
    console.log('\n📊 SPACING MEASUREMENTS:');
    console.log(`Record Income - Form to first input: ${recordDistance.toFixed(1)}px`);
    console.log(`Create Invoice - Form to first input: ${createDistance.toFixed(1)}px`);
    
    const difference = Math.abs(recordDistance - createDistance);
    console.log(`Difference: ${difference.toFixed(1)}px`);
    
    if (difference < 10) {
      console.log('✅ SPACING IS CONSISTENT (difference < 10px)');
    } else {
      console.log('❌ SPACING STILL DIFFERS (difference > 10px)');
    }
    
    // Also check the padding of containers
    const createInvoiceContainers = createInvoiceForm.querySelectorAll('.bg-gray-50, .dark\\:bg-gray-800');
    console.log(`\n📦 Found ${createInvoiceContainers.length} styled containers in Create Invoice`);
    
    createInvoiceContainers.forEach((container, index) => {
      const computedStyle = window.getComputedStyle(container);
      const padding = computedStyle.padding;
      console.log(`  Container ${index + 1} padding: ${padding}`);
    });
    
  } else {
    console.log('❌ Could not find input fields in both forms');
  }
}

console.log('\n🎯 EXPECTED RESULTS:');
console.log('- Both forms should have similar spacing from edge to first input');
console.log('- Create Invoice containers should have reduced padding');
console.log('- Difference should be less than 10px for visual consistency');
