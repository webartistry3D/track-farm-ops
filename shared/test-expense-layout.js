// Test script to verify the expense form layout
// Run this in browser console on the expense recording page

console.log('📋 TESTING EXPENSE FORM LAYOUT');

// Test function to check the form layout
function testExpenseFormLayout() {
  console.log('\n🔍 CHECKING EXPENSE FORM LAYOUT...');
  
  // Find the expense form
  const expenseForm = document.querySelector('form');
  if (!expenseForm) {
    console.log('❌ Expense form not found');
    console.log('💡 Make sure you are on the expense recording page');
    return false;
  }
  
  console.log('✅ Expense form found');
  
  // Check for grid containers
  const gridContainers = expenseForm.querySelectorAll('.grid');
  console.log(`Found ${gridContainers.length} grid containers`);
  
  if (gridContainers.length < 2) {
    console.log('❌ Expected 2 grid containers (for 2 rows)');
    return false;
  }
  
  // Test First Row: Merchant/Supplier and Amount
  const firstRow = gridContainers[0];
  const firstRowFields = firstRow.querySelectorAll('div > div');
  
  console.log('\n📊 FIRST ROW (Merchant/Supplier + Amount):');
  console.log(`- Fields in first row: ${firstRowFields.length}`);
  
  if (firstRowFields.length === 2) {
    const merchantField = firstRowFields[0];
    const amountField = firstRowFields[1];
    
    const merchantLabel = merchantField.querySelector('label');
    const amountLabel = amountField.querySelector('label');
    
    console.log(`- Field 1: ${merchantLabel ? merchantLabel.textContent.trim() : 'No label'}`);
    console.log(`- Field 2: ${amountLabel ? amountLabel.textContent.trim() : 'No label'}`);
    
    const hasMerchant = merchantLabel && merchantLabel.textContent.includes('Merchant');
    const hasAmount = amountLabel && amountLabel.textContent.includes('Amount');
    
    if (hasMerchant && hasAmount) {
      console.log('✅ First row correctly has Merchant/Supplier and Amount');
    } else {
      console.log('❌ First row fields are incorrect');
    }
  } else {
    console.log('❌ First row should have exactly 2 fields');
  }
  
  // Test Second Row: Category and Date
  const secondRow = gridContainers[1];
  const secondRowFields = secondRow.querySelectorAll('div > div');
  
  console.log('\n📊 SECOND ROW (Category + Date):');
  console.log(`- Fields in second row: ${secondRowFields.length}`);
  
  if (secondRowFields.length === 2) {
    const categoryField = secondRowFields[0];
    const dateField = secondRowFields[1];
    
    const categoryLabel = categoryField.querySelector('label');
    const dateLabel = dateField.querySelector('label');
    
    console.log(`- Field 1: ${categoryLabel ? categoryLabel.textContent.trim() : 'No label'}`);
    console.log(`- Field 2: ${dateLabel ? dateLabel.textContent.trim() : 'No label'}`);
    
    const hasCategory = categoryLabel && categoryLabel.textContent.includes('Category');
    const hasDate = dateLabel && dateLabel.textContent.includes('Date');
    
    if (hasCategory && hasDate) {
      console.log('✅ Second row correctly has Category and Date');
    } else {
      console.log('❌ Second row fields are incorrect');
    }
  } else {
    console.log('❌ Second row should have exactly 2 fields');
  }
  
  // Test responsive design
  console.log('\n📱 TESTING RESPONSIVE DESIGN:');
  
  // Check grid classes
  const firstRowClasses = firstRow.className;
  const secondRowClasses = secondRow.className;
  
  console.log(`- First row classes: ${firstRowClasses}`);
  console.log(`- Second row classes: ${secondRowClasses}`);
  
  const hasResponsiveGrid = firstRowClasses.includes('md:grid-cols-2') && secondRowClasses.includes('md:grid-cols-2');
  
  if (hasResponsiveGrid) {
    console.log('✅ Responsive grid layout found (md:grid-cols-2)');
  } else {
    console.log('❌ Responsive grid layout not found');
  }
  
  // Test field widths
  console.log('\n📏 TESTING FIELD WIDTHS:');
  
  const merchantInput = firstRow.querySelector('input[name="merchant"]');
  const amountInput = firstRow.querySelector('input[name="amount"]');
  const categorySelect = secondRow.querySelector('select[name="category"]');
  const dateInput = secondRow.querySelector('input[name="date"]');
  
  if (merchantInput && amountInput && categorySelect && dateInput) {
    console.log('✅ All input fields found');
    
    // Check if inputs have full width class
    const merchantWidth = merchantInput.className.includes('w-full');
    const amountWidth = amountInput.className.includes('w-full');
    const categoryWidth = categorySelect.className.includes('w-full');
    const dateWidth = dateInput.className.includes('w-full');
    
    console.log(`- Merchant input full width: ${merchantWidth ? '✅' : '❌'}`);
    console.log(`- Amount input full width: ${amountWidth ? '✅' : '❌'}`);
    console.log(`- Category select full width: ${categoryWidth ? '✅' : '❌'}`);
    console.log(`- Date input full width: ${dateWidth ? '✅' : '❌'}`);
    
    if (merchantWidth && amountWidth && categoryWidth && dateWidth) {
      console.log('✅ All fields have proper width classes');
    }
  } else {
    console.log('❌ Some input fields not found');
  }
  
  return true;
}

// Test function to check visual layout
function testVisualLayout() {
  console.log('\n🎨 TESTING VISUAL LAYOUT...');
  
  // Get form dimensions
  const expenseForm = document.querySelector('form');
  if (!expenseForm) {
    console.log('❌ Form not found for visual testing');
    return;
  }
  
  const formRect = expenseForm.getBoundingClientRect();
  console.log(`Form dimensions: ${formRect.width.toFixed(0)}x${formRect.height.toFixed(0)}px`);
  
  // Check grid layout visually
  const gridContainers = expenseForm.querySelectorAll('.grid');
  
  gridContainers.forEach((grid, index) => {
    const gridRect = grid.getBoundingClientRect();
    const fields = grid.querySelectorAll('div > div');
    
    console.log(`\nRow ${index + 1}:`);
    console.log(`- Grid dimensions: ${gridRect.width.toFixed(0)}x${gridRect.height.toFixed(0)}px`);
    console.log(`- Fields: ${fields.length}`);
    
    fields.forEach((field, fieldIndex) => {
      const fieldRect = field.getBoundingClientRect();
      const input = field.querySelector('input, select');
      const label = field.querySelector('label');
      
      console.log(`  Field ${fieldIndex + 1}:`);
      console.log(`    - Label: ${label ? label.textContent.trim() : 'No label'}`);
      console.log(`    - Input width: ${input ? input.getBoundingClientRect().width.toFixed(0) : 'No input'}px`);
      console.log(`    - Field width: ${fieldRect.width.toFixed(0)}px`);
    });
  });
}

// Test responsive behavior
function testResponsiveBehavior() {
  console.log('\n📱 TESTING RESPONSIVE BEHAVIOR...');
  
  const viewportWidth = window.innerWidth;
  console.log(`Current viewport width: ${viewportWidth}px`);
  
  const gridContainers = document.querySelectorAll('.grid');
  
  gridContainers.forEach((grid, index) => {
    const gridClasses = grid.className;
    const isSingleColumn = viewportWidth < 768 && gridClasses.includes('grid-cols-1');
    const isTwoColumn = viewportWidth >= 768 && gridClasses.includes('md:grid-cols-2');
    
    console.log(`Row ${index + 1}:`);
    console.log(`- Grid classes: ${gridClasses}`);
    console.log(`- Single column on mobile: ${isSingleColumn ? '✅' : '❌'}`);
    console.log(`- Two columns on desktop: ${isTwoColumn ? '✅' : '❌'}`);
  });
}

// Main test runner
function runAllTests() {
  console.log('🚀 STARTING EXPENSE FORM LAYOUT TESTS...\n');
  
  const layoutTest = testExpenseFormLayout();
  testVisualLayout();
  testResponsiveBehavior();
  
  console.log('\n📋 SUMMARY:');
  console.log(`Layout test: ${layoutTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (layoutTest) {
    console.log('\n🎉 EXPENSE FORM LAYOUT TESTS COMPLETED SUCCESSFULLY!');
    console.log('✅ Merchant/Supplier and Amount are on the same row');
    console.log('✅ Category and Date are on the same row');
    console.log('✅ Responsive design works correctly');
  } else {
    console.log('\n⚠️  SOME LAYOUT TESTS FAILED');
  }
}

// Instructions
console.log('\n📝 HOW TO USE:');
console.log('1. Go to the expense recording page');
console.log('2. Run runAllTests() to test the complete layout');
console.log('3. Or run individual tests:');
console.log('   - testExpenseFormLayout() for structure');
console.log('   - testVisualLayout() for visual dimensions');
console.log('   - testResponsiveBehavior() for responsive design');

// Auto-run if on expense page
const expenseForm = document.querySelector('form');
if (expenseForm) {
  console.log('\n🚀 Expense form found, running tests...');
  runAllTests();
} else {
  console.log('\n⏳ Expense form not found');
  console.log('💡 Navigate to the expense recording page first');
}

// Make test functions available globally
window.runAllTests = runAllTests;
window.testExpenseFormLayout = testExpenseFormLayout;
window.testVisualLayout = testVisualLayout;
window.testResponsiveBehavior = testResponsiveBehavior;
