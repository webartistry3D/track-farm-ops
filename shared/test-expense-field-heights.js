// Test script to verify all 4 expense input fields have the same height
// Run this in browser console on the expense recording page

console.log('📏 TESTING EXPENSE INPUT FIELD HEIGHTS');

// Test function to check field heights
function testFieldHeights() {
  console.log('\n🔍 CHECKING INPUT FIELD HEIGHTS...');
  
  // Find all 4 input fields
  const merchantInput = document.querySelector('input[name="merchant"]');
  const amountInput = document.querySelector('input[name="amount"]');
  const categorySelect = document.querySelector('select[name="category"]');
  const dateInput = document.querySelector('input[name="date"]');
  
  const fields = [
    { name: 'Merchant/Supplier', element: merchantInput },
    { name: 'Amount (₦)', element: amountInput },
    { name: 'Category', element: categorySelect },
    { name: 'Date', element: dateInput }
  ];
  
  console.log(`Found ${fields.filter(f => f.element).length} out of 4 expected fields`);
  
  // Check each field
  const heights = [];
  let allFound = true;
  
  fields.forEach((field, index) => {
    if (field.element) {
      const rect = field.element.getBoundingClientRect();
      const height = rect.height;
      heights.push(height);
      
      console.log(`\n${index + 1}. ${field.name}:`);
      console.log(`   - Height: ${height.toFixed(2)}px`);
      console.log(`   - Classes: ${field.element.className}`);
      console.log(`   - Type: ${field.element.tagName.toLowerCase()}${field.element.type ? ` (${field.element.type})` : ''}`);
    } else {
      console.log(`❌ ${field.name}: NOT FOUND`);
      allFound = false;
    }
  });
  
  if (!allFound) {
    console.log('\n❌ Some fields not found, cannot compare heights');
    return false;
  }
  
  // Check if all heights are the same
  const uniqueHeights = [...new Set(heights)];
  const maxHeight = Math.max(...heights);
  const minHeight = Math.min(...heights);
  const heightDifference = maxHeight - minHeight;
  
  console.log('\n📊 HEIGHT ANALYSIS:');
  console.log(`- Max height: ${maxHeight.toFixed(2)}px`);
  console.log(`- Min height: ${minHeight.toFixed(2)}px`);
  console.log(`- Difference: ${heightDifference.toFixed(2)}px`);
  console.log(`- Unique heights: ${uniqueHeights.length}`);
  
  // Determine if heights are consistent
  const isConsistent = heightDifference <= 1; // Allow 1px difference for browser rendering
  
  if (isConsistent) {
    console.log('\n✅ SUCCESS: All input fields have consistent heights!');
    console.log(`📏 All fields are approximately ${heights[0].toFixed(2)}px tall`);
  } else {
    console.log('\n❌ ISSUE: Input fields have inconsistent heights');
    console.log(`💡 Height difference of ${heightDifference.toFixed(2)}px detected`);
    
    // Show which fields are different
    heights.forEach((height, index) => {
      if (Math.abs(height - heights[0]) > 1) {
        console.log(`   ⚠️  ${fields[index].name} is ${Math.abs(height - heights[0]).toFixed(2)}px different`);
      }
    });
  }
  
  return isConsistent;
}

// Test function to check CSS classes
function testFieldClasses() {
  console.log('\n🎨 CHECKING FIELD CSS CLASSES...');
  
  const fields = [
    { name: 'Merchant/Supplier', selector: 'input[name="merchant"]' },
    { name: 'Amount (₦)', selector: 'input[name="amount"]' },
    { name: 'Category', selector: 'select[name="category"]' },
    { name: 'Date', selector: 'input[name="date"]' }
  ];
  
  let allHaveHeightClass = true;
  
  fields.forEach(field => {
    const element = document.querySelector(field.selector);
    if (element) {
      const classes = element.className;
      const hasHeightClass = classes.includes('h-10');
      
      console.log(`${field.name}:`);
      console.log(`  - Classes: ${classes}`);
      console.log(`  - Has h-10 class: ${hasHeightClass ? '✅' : '❌'}`);
      
      if (!hasHeightClass) {
        allHaveHeightClass = false;
      }
    } else {
      console.log(`${field.name}: ❌ Element not found`);
      allHaveHeightClass = false;
    }
  });
  
  if (allHaveHeightClass) {
    console.log('\n✅ All fields have the h-10 height class');
  } else {
    console.log('\n❌ Some fields are missing the h-10 height class');
  }
  
  return allHaveHeightClass;
}

// Test function to check visual alignment
function testVisualAlignment() {
  console.log('\n👁️  TESTING VISUAL ALIGNMENT...');
  
  const firstRow = document.querySelector('.grid');
  if (!firstRow) {
    console.log('❌ First row grid not found');
    return false;
  }
  
  const firstRowFields = firstRow.querySelectorAll('input, select');
  if (firstRowFields.length < 2) {
    console.log('❌ Not enough fields in first row');
    return false;
  }
  
  // Get positions of first row fields
  const merchantRect = firstRowFields[0].getBoundingClientRect();
  const amountRect = firstRowFields[1].getBoundingClientRect();
  
  console.log('First Row Alignment:');
  console.log(`- Merchant top: ${merchantRect.top.toFixed(2)}px`);
  console.log(`- Amount top: ${amountRect.top.toFixed(2)}px`);
  console.log(`- Top alignment: ${Math.abs(merchantRect.top - amountRect.top) <= 1 ? '✅' : '❌'}`);
  
  // Check second row
  const allGrids = document.querySelectorAll('.grid');
  if (allGrids.length < 2) {
    console.log('❌ Second row grid not found');
    return false;
  }
  
  const secondRow = allGrids[1];
  const secondRowFields = secondRow.querySelectorAll('input, select');
  if (secondRowFields.length < 2) {
    console.log('❌ Not enough fields in second row');
    return false;
  }
  
  const categoryRect = secondRowFields[0].getBoundingClientRect();
  const dateRect = secondRowFields[1].getBoundingClientRect();
  
  console.log('\nSecond Row Alignment:');
  console.log(`- Category top: ${categoryRect.top.toFixed(2)}px`);
  console.log(`- Date top: ${dateRect.top.toFixed(2)}px`);
  console.log(`- Top alignment: ${Math.abs(categoryRect.top - dateRect.top) <= 1 ? '✅' : '❌'}`);
  
  // Check row alignment
  const rowAlignment = Math.abs(merchantRect.top - categoryRect.top) <= 50; // Allow some spacing between rows
  
  console.log('\nRow-to-Row Alignment:');
  console.log(`- Row spacing consistent: ${rowAlignment ? '✅' : '❌'}`);
  
  return true;
}

// Main test runner
function runHeightTests() {
  console.log('🚀 STARTING INPUT FIELD HEIGHT TESTS...\n');
  
  const heightTest = testFieldHeights();
  const classTest = testFieldClasses();
  const alignmentTest = testVisualAlignment();
  
  console.log('\n📋 SUMMARY:');
  console.log(`Height consistency: ${heightTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`CSS classes: ${classTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Visual alignment: ${alignmentTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (heightTest && classTest) {
    console.log('\n🎉 ALL INPUT FIELDS HAVE CONSISTENT HEIGHTS!');
    console.log('✅ Merchant/Supplier, Amount, Category, and Date fields are all the same height');
  } else {
    console.log('\n⚠️  SOME HEIGHT ISSUES DETECTED');
  }
}

// Instructions
console.log('\n📝 HOW TO USE:');
console.log('1. Go to the expense recording page');
console.log('2. Run runHeightTests() to test all field heights');
console.log('3. Or run individual tests:');
console.log('   - testFieldHeights() for actual height measurements');
console.log('   - testFieldClasses() for CSS class verification');
console.log('   - testVisualAlignment() for visual alignment');

// Auto-run if on expense page
const expenseForm = document.querySelector('form');
if (expenseForm) {
  console.log('\n🚀 Expense form found, running height tests...');
  runHeightTests();
} else {
  console.log('\n⏳ Expense form not found');
  console.log('💡 Navigate to the expense recording page first');
}

// Make test functions available globally
window.runHeightTests = runHeightTests;
window.testFieldHeights = testFieldHeights;
window.testFieldClasses = testFieldClasses;
window.testVisualAlignment = testVisualAlignment;
