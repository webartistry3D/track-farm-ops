// Test script to verify placeholder CSS fix
// Run this in browser console after refreshing

console.log('🧪 TESTING PLACEHOLDER CSS FIX');

// Find all number inputs
const numberInputs = document.querySelectorAll('input[type="number"]');
console.log(`Found ${numberInputs.length} number inputs`);

// Test each input
numberInputs.forEach((input, index) => {
  const label = input.closest('div')?.querySelector('label')?.textContent || 'No label';
  const placeholder = input.getAttribute('placeholder');
  const computedPlaceholder = window.getComputedStyle(input, '::placeholder');
  
  console.log(`\n📋 Input ${index + 1}:`);
  console.log(`  Label: "${label.trim()}"`);
  console.log(`  HTML placeholder: "${placeholder}"`);
  console.log(`  ::placeholder color: ${computedPlaceholder.color}`);
  console.log(`  ::placeholder opacity: ${computedPlaceholder.opacity}`);
  console.log(`  ::placeholder content: ${computedPlaceholder.content}`);
  
  // Check if placeholder is visually hidden
  const isHidden = computedPlaceholder.color === 'transparent' || 
                   computedPlaceholder.opacity === '0' ||
                   computedPlaceholder.content === 'none';
  
  console.log(`  Visually hidden: ${isHidden ? '✅ YES' : '❌ NO'}`);
});

console.log('\n🎯 If "Visually hidden: ✅ YES" for all inputs, the fix is working!');
