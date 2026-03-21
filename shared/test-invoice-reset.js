// Test script to verify invoice form reset functionality
// Run this in browser console after generating an invoice

console.log('🔄 TESTING INVOICE FORM RESET FUNCTIONALITY');

// Test function to check form values
function checkFormValues() {
  const form = document.querySelector('form[onsubmit*="generateInvoice"]');
  if (!form) {
    console.log('❌ Invoice form not found');
    return null;
  }

  const inputs = form.querySelectorAll('input');
  const formValues = {};
  
  inputs.forEach(input => {
    if (input.name) {
      formValues[input.name] = input.value;
    }
  });

  // Check textarea for notes
  const notesTextarea = form.querySelector('textarea[name="notes"]');
  if (notesTextarea) {
    formValues.notes = notesTextarea.value;
  }

  return formValues;
}

// Test the reset functionality
function testInvoiceReset() {
  console.log('\n📋 CURRENT FORM VALUES BEFORE RESET:');
  const beforeReset = checkFormValues();
  
  if (!beforeReset) {
    console.log('❌ Could not read form values');
    return;
  }

  console.log('Before reset:', beforeReset);

  // Find and click the Create New Invoice button
  const createNewButton = Array.from(document.querySelectorAll('button')).find(button => 
    button.textContent && button.textContent.includes('Create New Invoice')
  );

  if (!createNewButton) {
    console.log('❌ Create New Invoice button not found');
    console.log('💡 Make sure you have generated an invoice first to see this button');
    return;
  }

  console.log('\n🔄 Clicking Create New Invoice button...');
  
  // Click the button to trigger reset
  createNewButton.click();

  // Wait a moment for the state to update
  setTimeout(() => {
    console.log('\n📋 FORM VALUES AFTER RESET:');
    const afterReset = checkFormValues();
    
    if (!afterReset) {
      console.log('❌ Could not read form values after reset');
      return;
    }

    console.log('After reset:', afterReset);

    // Check if fields are properly reset
    const resetChecks = {
      clientName: afterReset.clientName === '',
      clientEmail: afterReset.clientEmail === '',
      clientPhone: afterReset.clientPhone === '',
      clientAddress: afterReset.clientAddress === '',
      invoiceNumber: afterReset.invoiceNumber === '',
      notes: afterReset.notes === '',
      quantity: afterReset.quantity === '',
      unitPrice: afterReset.unitPrice === ''
    };

    console.log('\n✅ RESET VALIDATION:');
    Object.entries(resetChecks).forEach(([field, isReset]) => {
      console.log(`  ${field}: ${isReset ? '✅' : '❌'} ${isReset ? 'Reset' : 'Not reset'}`);
    });

    const allReset = Object.values(resetChecks).every(check => check);
    
    if (allReset) {
      console.log('\n🎉 FORM RESET SUCCESSFUL!');
      console.log('✅ All fields have been cleared');
      console.log('✅ Form is ready for new invoice entry');
    } else {
      console.log('\n⚠️  SOME FIELDS WERE NOT RESET PROPERLY');
    }

    // Check if dates are set to today and 7 days from now
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const dateChecks = {
      invoiceDate: afterReset.invoiceDate === today,
      dueDate: afterReset.dueDate === nextWeek
    };

    console.log('\n📅 DATE VALIDATION:');
    Object.entries(dateChecks).forEach(([field, isCorrect]) => {
      console.log(`  ${field}: ${isCorrect ? '✅' : '❌'} Expected: ${field === 'invoiceDate' ? today : nextWeek}, Got: ${afterReset[field]}`);
    });

  }, 500);
}

// Instructions for testing
console.log('\n📝 HOW TO TEST:');
console.log('1. Go to Create Invoice tab');
console.log('2. Fill in some invoice details');
console.log('3. Click "Generate Invoice"');
console.log('4. Run this script again to test the reset');
console.log('5. Or call testInvoiceReset() manually');

// Auto-run if we can find the button
const createNewButton = Array.from(document.querySelectorAll('button')).find(button => 
  button.textContent && button.textContent.includes('Create New Invoice')
);

if (createNewButton) {
  console.log('\n🚀 Create New Invoice button found, running test...');
  testInvoiceReset();
} else {
  console.log('\n⏳ Create New Invoice button not found');
  console.log('💡 Generate an invoice first, then run testInvoiceReset()');
}

// Make the test function available globally
window.testInvoiceReset = testInvoiceReset;
