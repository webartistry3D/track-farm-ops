// Comprehensive Placeholder Debugging Script
// Run this in browser console to diagnose the placeholder issue

console.log('🔍 COMPREHENSIVE PLACEHOLDER DEBUGGING');
console.log('=====================================');

// 1. Check current page state
console.log('📊 PAGE STATE:');
console.log('- Current URL:', window.location.href);
console.log('- Page title:', document.title);
console.log('- User agent:', navigator.userAgent);

// 2. Check if we're on the right tab
console.log('\n🎯 TAB DETECTION:');
const activeTab = document.querySelector('[role="tab"][aria-selected="true"]');
if (activeTab) {
  console.log('- Active tab:', activeTab.textContent);
} else {
  console.log('- No active tab found');
}

// 3. Find all quantity and unit price inputs
console.log('\n🔍 INPUT FIELD ANALYSIS:');

// Find quantity inputs
const quantityInputs = document.querySelectorAll('input[type="number"]');
console.log(`- Found ${quantityInputs.length} number inputs:`);

quantityInputs.forEach((input, index) => {
  const label = input.closest('div')?.querySelector('label')?.textContent || 'No label';
  const placeholder = input.getAttribute('placeholder');
  const value = input.value;
  const id = input.id || input.name || `input-${index}`;
  
  console.log(`  ${index + 1}. ID: ${id}`);
  console.log(`     Label: ${label.trim()}`);
  console.log(`     Placeholder: "${placeholder}"`);
  console.log(`     Value: "${value}"`);
  console.log(`     Has placeholder attribute: ${input.hasAttribute('placeholder')}`);
  console.log('');
});

// 4. Check for invoice-specific inputs
console.log('\n📋 INVOICE SECTION ANALYSIS:');
const invoiceSection = document.querySelector('[data-testid="invoice"]') || 
                       document.querySelector('.invoice') ||
                       document.querySelector('form');

if (invoiceSection) {
  const invoiceInputs = invoiceSection.querySelectorAll('input[type="number"]');
  console.log(`- Found ${invoiceInputs.length} inputs in invoice section:`);
  
  invoiceInputs.forEach((input, index) => {
    const placeholder = input.getAttribute('placeholder');
    console.log(`  ${index + 1}. Placeholder: "${placeholder}"`);
  });
} else {
  console.log('- No invoice section found');
}

// 5. Check React component state (if possible)
console.log('\n⚛️  REACT STATE ANALYSIS:');
try {
  // Try to access React DevTools if available
  const reactRoot = document.querySelector('#root');
  if (reactRoot && reactRoot._reactRootContainer) {
    console.log('- React root found');
  } else {
    console.log('- React root not detected');
  }
} catch (error) {
  console.log('- Could not analyze React state:', error.message);
}

// 6. Check for CSS that might be showing placeholders
console.log('\n🎨 CSS ANALYSIS:');
const styleSheets = Array.from(document.styleSheets);
let placeholderCSSFound = false;

styleSheets.forEach((sheet, index) => {
  try {
    const rules = Array.from(sheet.cssRules || sheet.rules || []);
    rules.forEach(rule => {
      if (rule.cssText && rule.cssText.includes('placeholder')) {
        console.log(`- Found placeholder CSS in stylesheet ${index}:`);
        console.log(`  ${rule.cssText.substring(0, 100)}...`);
        placeholderCSSFound = true;
      }
    });
  } catch (error) {
    // CORS issues with external stylesheets
  }
});

if (!placeholderCSSFound) {
  console.log('- No placeholder CSS found');
}

// 7. Check for any JavaScript that might be adding placeholders
console.log('\n📜 JAVASCRIPT ANALYSIS:');
const scripts = Array.from(document.scripts);
console.log(`- Found ${scripts.length} scripts on page`);

// Look for any scripts that might be manipulating inputs
const inputManipulatingScripts = scripts.filter(script => {
  return script.textContent && (
    script.textContent.includes('placeholder') ||
    script.textContent.includes('setAttribute')
  );
});

if (inputManipulatingScripts.length > 0) {
  console.log(`- Found ${inputManipulatingScripts.length} scripts that might manipulate inputs:`);
  inputManipulatingScripts.forEach((script, index) => {
    console.log(`  Script ${index + 1}: ${script.src || 'inline script'}`);
  });
} else {
  console.log('- No input-manipulating scripts detected');
}

// 8. Check browser cache and reload info
console.log('\n🔄 CACHE ANALYSIS:');
console.log('- Page loaded at:', new Date(document.lastModified));
console.log('- Current time:', new Date());
console.log('- Time since load:', Date.now() - performance.timing.navigationStart, 'ms');

// 9. Try to manually remove placeholders
console.log('\n🔧 MANUAL PLACEHOLDER REMOVAL TEST:');
let removedCount = 0;

quantityInputs.forEach(input => {
  const placeholder = input.getAttribute('placeholder');
  if (placeholder && (placeholder.includes('0') || placeholder.toLowerCase().includes('qty') || placeholder.toLowerCase().includes('unit'))) {
    console.log(`- Removing placeholder: "${placeholder}"`);
    input.removeAttribute('placeholder');
    removedCount++;
  }
});

console.log(`- Manually removed ${removedCount} placeholders`);

// 10. Final verification
console.log('\n✅ FINAL VERIFICATION:');
const remainingPlaceholders = Array.from(document.querySelectorAll('input[placeholder]'))
  .filter(input => {
    const placeholder = input.getAttribute('placeholder');
    return placeholder && (
      placeholder.includes('0') || 
      placeholder.toLowerCase().includes('qty') || 
      placeholder.toLowerCase().includes('unit')
    );
  });

console.log(`- Remaining problematic placeholders: ${remainingPlaceholders.length}`);
remainingPlaceholders.forEach((input, index) => {
  console.log(`  ${index + 1}. "${input.getAttribute('placeholder')}"`);
});

console.log('\n🎯 DEBUGGING COMPLETE');
console.log('===================');
console.log('If placeholders are still visible after this script,');
console.log('the issue might be:');
console.log('1. CSS pseudo-elements (::placeholder)');
console.log('2. JavaScript running after this script');
console.log('3. Browser caching issues');
console.log('4. Component not re-rendering');
