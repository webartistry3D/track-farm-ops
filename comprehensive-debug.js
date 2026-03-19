// RUN THIS IN BROWSER CONSOLE
// Comprehensive debugging for placeholder issue

console.log('🚀 STARTING COMPREHENSIVE PLACEHOLDER DEBUGGING');
console.log('===============================================');

// 1. Check if we're on the right page and tab
console.log('📍 LOCATION CHECK:');
console.log('- URL:', window.location.href);
console.log('- Path:', window.location.pathname);

// Check if we're on income page
if (!window.location.pathname.includes('/income')) {
  console.log('❌ NOT on income page! Navigate to /income first');
} else {
  console.log('✅ On income page');
}

// 2. Find and analyze all relevant inputs
console.log('\n🔍 INPUT ANALYSIS:');

// Find all number inputs
const allNumberInputs = document.querySelectorAll('input[type="number"]');
console.log(`Found ${allNumberInputs.length} number inputs`);

// Find quantity and unit price inputs specifically
const relevantInputs = Array.from(allNumberInputs).filter(input => {
  const label = input.closest('div')?.querySelector('label')?.textContent || '';
  const placeholder = input.getAttribute('placeholder') || '';
  const name = input.name || '';
  const id = input.id || '';
  
  return label.toLowerCase().includes('quantity') || 
         label.toLowerCase().includes('unit price') ||
         placeholder.toLowerCase().includes('qty') ||
         placeholder.toLowerCase().includes('unit') ||
         name.toLowerCase().includes('quantity') ||
         name.toLowerCase().includes('unitprice') ||
         id.toLowerCase().includes('quantity') ||
         id.toLowerCase().includes('unitprice');
});

console.log(`Found ${relevantInputs.length} relevant inputs:`);

relevantInputs.forEach((input, index) => {
  const label = input.closest('div')?.querySelector('label')?.textContent || 'No label';
  const placeholder = input.getAttribute('placeholder');
  const value = input.value;
  const hasPlaceholder = input.hasAttribute('placeholder');
  
  console.log(`\n📋 Input ${index + 1}:`);
  console.log(`  Label: "${label.trim()}"`);
  console.log(`  Placeholder: "${placeholder}"`);
  console.log(`  Value: "${value}"`);
  console.log(`  Has placeholder attr: ${hasPlaceholder}`);
  console.log(`  HTML: ${input.outerHTML.substring(0, 100)}...`);
});

// 3. Check for CSS pseudo-elements
console.log('\n🎨 CSS PLACEHOLDER STYLING:');
const computedStyles = relevantInputs.map(input => {
  const styles = window.getComputedStyle(input, '::placeholder');
  return {
    input: input.outerHTML.substring(0, 50),
    placeholderContent: styles.content,
    placeholderColor: styles.color,
    placeholderOpacity: styles.opacity
  };
});

computedStyles.forEach((style, index) => {
  console.log(`Input ${index + 1}:`);
  console.log(`  ::placeholder content: "${style.placeholderContent}"`);
  console.log(`  ::placeholder color: ${style.placeholderColor}`);
  console.log(`  ::placeholder opacity: ${style.placeholderOpacity}`);
});

// 4. Check for JavaScript that might be adding placeholders
console.log('\n⚡ DYNAMIC PLACEHOLDER CHECK:');

// Monitor for changes
relevantInputs.forEach((input, index) => {
  const originalPlaceholder = input.getAttribute('placeholder');
  
  // Create a mutation observer
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'placeholder') {
        console.log(`🔄 Placeholder changed on input ${index + 1}:`);
        console.log(`  From: "${originalPlaceholder}"`);
        console.log(`  To: "${input.getAttribute('placeholder')}"`);
        console.log(`  Timestamp: ${new Date().toISOString()}`);
      }
    });
  });
  
  observer.observe(input, { attributes: true, attributeFilter: ['placeholder'] });
  
  console.log(`👁️ Monitoring input ${index + 1} for placeholder changes`);
});

// 5. Try to force remove placeholders
console.log('\n🔧 FORCE PLACEHOLDER REMOVAL:');
let removalCount = 0;

relevantInputs.forEach((input, index) => {
  const placeholder = input.getAttribute('placeholder');
  
  if (placeholder && (
    placeholder.includes('0') || 
    placeholder.toLowerCase().includes('qty') || 
    placeholder.toLowerCase().includes('unit')
  )) {
    console.log(`🗑️ Removing placeholder from input ${index + 1}: "${placeholder}"`);
    input.removeAttribute('placeholder');
    removalCount++;
    
    // Also check for any CSS that might be showing placeholder text
    input.style.setProperty('::placeholder', { content: 'none' });
  }
});

console.log(`✅ Removed ${removalCount} placeholders`);

// 6. Check if React is re-rendering
console.log('\n⚛️  REACT RENDER CHECK:');

// Look for React root
const reactRoot = document.querySelector('#root');
if (reactRoot) {
  console.log('✅ React root found');
  
  // Check if there are any React-related attributes
  const reactElements = document.querySelectorAll('[data-reactroot], [data-reactid]');
  console.log(`Found ${reactElements.length} React elements with special attributes`);
} else {
  console.log('❌ No React root found');
}

// 7. Final verification
console.log('\n🎯 FINAL VERIFICATION:');

setTimeout(() => {
  console.log('Checking again after 2 seconds...');
  
  const remainingPlaceholders = Array.from(document.querySelectorAll('input[placeholder]'))
    .filter(input => {
      const placeholder = input.getAttribute('placeholder') || '';
      return placeholder.includes('0') || 
             placeholder.toLowerCase().includes('qty') || 
             placeholder.toLowerCase().includes('unit');
    });
  
  console.log(`Remaining problematic placeholders: ${remainingPlaceholders.length}`);
  
  if (remainingPlaceholders.length > 0) {
    console.log('❌ ISSUE PERSISTS - Remaining placeholders:');
    remainingPlaceholders.forEach((input, index) => {
      console.log(`  ${index + 1}. "${input.getAttribute('placeholder')}"`);
      console.log(`     HTML: ${input.outerHTML}`);
    });
    
    console.log('\n🔍 POSSIBLE CAUSES:');
    console.log('1. JavaScript is adding placeholders after removal');
    console.log('2. CSS pseudo-elements are showing placeholder text');
    console.log('3. React component is re-rendering with old props');
    console.log('4. Browser extension is interfering');
    console.log('5. Development server is serving old code');
    
  } else {
    console.log('✅ SUCCESS - All placeholders removed!');
  }
}, 2000);

console.log('\n🏁 DEBUGGING SCRIPT RUNNING...');
console.log('Watch the console for any "🔄 Placeholder changed" messages');
