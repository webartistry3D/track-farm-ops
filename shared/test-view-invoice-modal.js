// Test script to verify the View Invoice modal functionality
// Run this in browser console after refreshing

console.log('👁️  TESTING VIEW INVOICE MODAL');

// Test function to check if modal exists and works
function testViewInvoiceModal() {
  console.log('\n🔍 LOOKING FOR INVOICE RECORDS...');
  
  // Find invoice records table
  const invoiceTables = document.querySelectorAll('table');
  let invoiceTable = null;
  
  invoiceTables.forEach(table => {
    const headers = table.querySelectorAll('th');
    const hasInvoiceHeaders = Array.from(headers).some(th => 
      th.textContent && (th.textContent.includes('Invoice') || th.textContent.includes('Client'))
    );
    if (hasInvoiceHeaders) {
      invoiceTable = table;
    }
  });
  
  if (!invoiceTable) {
    console.log('❌ No invoice records table found');
    console.log('💡 Make sure you have some invoice records first');
    return;
  }
  
  console.log('✅ Invoice records table found');
  
  // Find the first invoice row with actions
  const invoiceRows = invoiceTable.querySelectorAll('tbody tr');
  let targetRow = null;
  
  for (const row of invoiceRows) {
    const actionsCell = row.querySelector('td:last-child');
    if (actionsCell && actionsCell.textContent.includes('Actions')) {
      targetRow = row;
      break;
    }
  }
  
  if (!targetRow) {
    console.log('❌ No invoice row with actions found');
    return;
  }
  
  console.log('✅ Found invoice row with actions');
  
  // Find the actions dropdown button
  const actionsButton = targetRow.querySelector('button[aria-label*="Actions"], button:has(svg)');
  if (!actionsButton) {
    console.log('❌ Actions dropdown button not found');
    return;
  }
  
  console.log('✅ Found actions dropdown button');
  
  // Click the actions dropdown
  actionsButton.click();
  
  // Wait for dropdown to appear
  setTimeout(() => {
    console.log('\n📋 LOOKING FOR VIEW INVOICE OPTION...');
    
    // Find the View Invoice option
    const viewInvoiceOption = Array.from(document.querySelectorAll('button')).find(button => 
      button.textContent && button.textContent.includes('View Invoice')
    );
    
    if (!viewInvoiceOption) {
      console.log('❌ View Invoice option not found in dropdown');
      return;
    }
    
    console.log('✅ Found View Invoice option');
    
    // Click View Invoice to open modal
    viewInvoiceOption.click();
    
    // Wait for modal to appear
    setTimeout(() => {
      console.log('\n🎭 CHECKING MODAL...');
      
      // Check if modal is visible
      const modal = document.querySelector('[class*="fixed inset-0"]');
      if (!modal) {
        console.log('❌ Modal not found');
        return;
      }
      
      console.log('✅ Modal is visible');
      
      // Check modal content
      const modalContent = modal.querySelector('.max-w-5xl');
      if (!modalContent) {
        console.log('❌ Modal content not found');
        return;
      }
      
      console.log('✅ Modal content found');
      
      // Check for invoice details
      const invoiceTitle = modalContent.querySelector('h3');
      if (invoiceTitle) {
        console.log(`📄 Invoice Title: ${invoiceTitle.textContent}`);
      }
      
      // Check for invoice preview
      const invoicePreview = modalContent.querySelector('.bg-white, .dark\\:bg-gray-800');
      if (invoicePreview) {
        console.log('✅ Invoice preview found');
        
        // Check for key sections
        const sections = {
          'Invoice Header': invoicePreview.querySelector('h1'),
          'Business Info': invoicePreview.querySelector('h3'),
          'Items Table': invoicePreview.querySelector('table'),
          'Download Button': modalContent.querySelector('button:has([class*="Download"])'),
          'Send Button': modalContent.querySelector('button:has([class*="Send"])'),
          'Close Button': modalContent.querySelector('button[onclick*="setShowViewModal"]')
        };
        
        console.log('\n📊 MODAL SECTIONS CHECK:');
        Object.entries(sections).forEach(([section, element]) => {
          console.log(`  ${section}: ${element ? '✅' : '❌'} ${element ? 'Found' : 'Not found'}`);
        });
        
        // Test close functionality
        const closeButton = modalContent.querySelector('button[onclick*="setShowViewModal"]');
        if (closeButton) {
          console.log('\n🔄 TESTING CLOSE FUNCTIONALITY...');
          closeButton.click();
          
          setTimeout(() => {
            const modalAfterClose = document.querySelector('[class*="fixed inset-0"]');
            if (!modalAfterClose) {
              console.log('✅ Modal closed successfully');
            } else {
              console.log('❌ Modal still visible after close');
            }
          }, 500);
        }
        
        console.log('\n🎉 VIEW INVOICE MODAL TEST COMPLETE!');
        
      } else {
        console.log('❌ Invoice preview not found in modal');
      }
      
    }, 1000);
    
  }, 500);
}

// Test download functionality
function testDownloadFunction() {
  console.log('\n📥 TESTING DOWNLOAD FUNCTION...');
  
  const downloadButton = document.querySelector('button:has([class*="Download"])');
  if (downloadButton) {
    console.log('✅ Download button found');
    console.log('💡 Click to test download functionality');
    // Note: We won't auto-click download as it triggers file download
  } else {
    console.log('❌ Download button not found');
  }
}

// Test send functionality
function testSendFunction() {
  console.log('\n📧 TESTING SEND FUNCTION...');
  
  const sendButton = document.querySelector('button:has([class*="Send"])');
  if (sendButton) {
    console.log('✅ Send button found');
    console.log('💡 Click to test email functionality');
    // Note: We won't auto-click send as it opens email client
  } else {
    console.log('❌ Send button not found');
  }
}

// Instructions
console.log('\n📝 HOW TO TEST:');
console.log('1. Go to Invoice Records tab');
console.log('2. Make sure you have some invoice records');
console.log('3. Run testViewInvoiceModal() to test the modal');
console.log('4. Run testDownloadFunction() to check download button');
console.log('5. Run testSendFunction() to check send button');

// Auto-run if we can find invoice records
const invoiceTables = document.querySelectorAll('table');
let hasInvoices = false;

invoiceTables.forEach(table => {
  const headers = table.querySelectorAll('th');
  const hasInvoiceHeaders = Array.from(headers).some(th => 
    th.textContent && (th.textContent.includes('Invoice') || th.textContent.includes('Client'))
  );
  if (hasInvoiceHeaders) {
    hasInvoices = true;
  }
});

if (hasInvoices) {
  console.log('\n🚀 Invoice records found, running test...');
  testViewInvoiceModal();
} else {
  console.log('\n⏳ No invoice records found');
  console.log('💡 Create some invoices first, then run testViewInvoiceModal()');
}

// Make test functions available globally
window.testViewInvoiceModal = testViewInvoiceModal;
window.testDownloadFunction = testDownloadFunction;
window.testSendFunction = testSendFunction;
