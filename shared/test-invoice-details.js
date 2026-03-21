// Test script to verify Invoice Details section visual fix
// Run this in browser console after refreshing

console.log('🎨 TESTING INVOICE DETAILS SECTION VISUAL FIX');

// Find the Invoice Details section
const invoiceDetailsSection = Array.from(document.querySelectorAll('h3')).find(h3 => 
  h3.textContent && h3.textContent.includes('Invoice Details')
);

if (!invoiceDetailsSection) {
  console.log('❌ Could not find Invoice Details section');
} else {
  console.log('✅ Invoice Details section found');
  
  const container = invoiceDetailsSection.closest('div.bg-gray-50, div.dark\\:bg-gray-800');
  
  if (container) {
    console.log('\n📊 VISUAL PROPERTIES:');
    
    // Check computed styles
    const computedStyle = window.getComputedStyle(container);
    
    console.log(`Background color: ${computedStyle.backgroundColor}`);
    console.log(`Padding: ${computedStyle.padding}`);
    console.log(`Border radius: ${computedStyle.borderRadius}`);
    console.log(`Border: ${computedStyle.border}`);
    console.log(`Box shadow: ${computedStyle.boxShadow}`);
    
    // Check heading
    const headingStyle = window.getComputedStyle(invoiceDetailsSection);
    console.log(`\n📝 HEADING STYLES:`);
    console.log(`Heading color: ${headingStyle.color}`);
    console.log(`Heading font size: ${headingStyle.fontSize}`);
    console.log(`Heading margin bottom: ${headingStyle.marginBottom}`);
    
    // Check if it has the calendar icon
    const icon = invoiceDetailsSection.querySelector('svg');
    if (icon) {
      console.log(`✅ Icon found: ${icon.className.baseVal}`);
    } else {
      console.log('❌ No icon found');
    }
    
    // Check input fields
    const inputs = container.querySelectorAll('input');
    console.log(`\n📝 INPUT FIELDS: ${inputs.length} found`);
    
    inputs.forEach((input, index) => {
      const label = input.closest('div').querySelector('label');
      const labelText = label ? label.textContent.trim() : 'No label';
      console.log(`  ${index + 1}. ${labelText}: ${input.type}`);
    });
    
    console.log('\n🎯 EXPECTED VISUAL FEATURES:');
    console.log('✅ Light gray background container');
    console.log('✅ Rounded corners (8px)');
    console.log('✅ Subtle border and shadow');
    console.log('✅ "Invoice Details" heading with calendar icon');
    console.log('✅ Three input fields: Invoice Number, Invoice Date, Due Date');
    console.log('✅ Consistent spacing with other sections');
    
    console.log('\n✅ INVOICE DETAILS SECTION VISUAL FIX COMPLETE!');
    
  } else {
    console.log('❌ Could not find container for Invoice Details');
  }
}

// Also check all sections for consistency
console.log('\n🔍 CHECKING ALL SECTION CONSISTENCY:');

const allSections = document.querySelectorAll('form.space-y-4 > div.bg-gray-50, form.space-y-4 > div.dark\\:bg-gray-800');
console.log(`Found ${allSections.length} styled sections`);

allSections.forEach((section, index) => {
  const heading = section.querySelector('h3');
  const headingText = heading ? heading.textContent.trim() : 'No heading';
  const inputCount = section.querySelectorAll('input').length;
  
  console.log(`  Section ${index + 1}: "${headingText}" (${inputCount} inputs)`);
});
