// Test script to verify inputs are now empty
// Run this in browser console after refreshing

console.log('🧪 TESTING EMPTY INPUTS');

// Find quantity and unit price inputs
const quantityInputs = Array.from(document.querySelectorAll('input[type="number"]')).filter(input => {
  const label = input.closest('div')?.querySelector('label')?.textContent || '';
  return label.toLowerCase().includes('quantity');
});

const unitPriceInputs = Array.from(document.querySelectorAll('input[type="number"]')).filter(input => {
  const label = input.closest('div')?.querySelector('label')?.textContent || '';
  return label.toLowerCase().includes('unit price');
});

console.log(`Found ${quantityInputs.length} quantity inputs`);
console.log(`Found ${unitPriceInputs.length} unit price inputs`);

// Test quantity inputs
quantityInputs.forEach((input, index) => {
  console.log(`\n📊 Quantity Input ${index + 1}:`);
  console.log(`  Value: "${input.value}"`);
  console.log(`  Is empty: ${input.value === '' ? '✅ YES' : '❌ NO'}`);
  console.log(`  Has placeholder: ${input.hasAttribute('placeholder') ? 'YES' : 'NO'}`);
});

// Test unit price inputs
unitPriceInputs.forEach((input, index) => {
  console.log(`\n💰 Unit Price Input ${index + 1}:`);
  console.log(`  Value: "${input.value}"`);
  console.log(`  Is empty: ${input.value === '' ? '✅ YES' : '❌ NO'}`);
  console.log(`  Has placeholder: ${input.hasAttribute('placeholder') ? 'YES' : 'NO'}`);
});

console.log('\n🎯 SUCCESS CRITERIA:');
console.log('- All quantity inputs should have value: "" (empty string)');
console.log('- All unit price inputs should have value: "" (empty string)');
console.log('- No placeholder attributes should be present');
