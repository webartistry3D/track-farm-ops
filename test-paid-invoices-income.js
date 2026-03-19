// Test script to verify paid invoices appear in Income Records table
// Run this in browser console after marking an invoice as paid

console.log('💰 TESTING PAID INVOICES IN INCOME RECORDS');

// Test function to check if paid invoices appear in income records
function testPaidInvoicesInIncomeRecords() {
  console.log('\n🔍 CHECKING INCOME RECORDS FOR PAID INVOICES...');
  
  // Check localStorage for income entries from paid invoices
  const storedIncomes = localStorage.getItem('farm_incomes');
  const localIncomes = storedIncomes ? JSON.parse(storedIncomes) : [];
  
  console.log(`Found ${localIncomes.length} income entries in localStorage`);
  
  // Filter for income entries from paid invoices
  const paidInvoiceIncomes = localIncomes.filter((income: any) => 
    income.description && income.description.includes('Payment for invoice #')
  );
  
  console.log(`Found ${paidInvoiceIncomes.length} income entries from paid invoices`);
  
  if (paidInvoiceIncomes.length > 0) {
    console.log('\n📋 PAID INVOICE INCOME ENTRIES:');
    paidInvoiceIncomes.forEach((income: any, index: number) => {
      console.log(`  ${index + 1}. ${income.description}`);
      console.log(`     Amount: ₦${parseFloat(income.amount || 0).toLocaleString()}`);
      console.log(`     Date: ${income.date}`);
      console.log(`     Category: ${income.category}`);
      console.log(`     Payment Method: ${income.paymentMethod}`);
      console.log(`     Created: ${income.createdAt}`);
      console.log('');
    });
  } else {
    console.log('❌ No income entries from paid invoices found');
  }
  
  // Check if these appear in the Income Records table
  console.log('\n📊 CHECKING INCOME RECORDS TABLE...');
  
  // Find the Income Records table
  const incomeTables = document.querySelectorAll('table');
  let incomeTable = null;
  
  incomeTables.forEach(table => {
    const headers = table.querySelectorAll('th');
    const hasIncomeHeaders = Array.from(headers).some(th => 
      th.textContent && (th.textContent.includes('Description') || th.textContent.includes('Amount') || th.textContent.includes('Date'))
    );
    if (hasIncomeHeaders) {
      incomeTable = table;
    }
  });
  
  if (!incomeTable) {
    console.log('❌ Income Records table not found');
    return false;
  }
  
  console.log('✅ Income Records table found');
  
  // Get all rows in the table
  const tableRows = incomeTable.querySelectorAll('tbody tr');
  console.log(`Found ${tableRows.length} rows in Income Records table`);
  
  // Look for paid invoice entries in the table
  let foundInTable = 0;
  tableRows.forEach((row, index) => {
    const cells = row.querySelectorAll('td');
    if (cells.length > 0) {
      const descriptionCell = cells[0]; // Assuming description is first column
      const descriptionText = descriptionCell.textContent || '';
      
      if (descriptionText.includes('Payment for invoice #')) {
        foundInTable++;
        console.log(`✅ Row ${index + 1}: ${descriptionText}`);
      }
    }
  });
  
  console.log(`\n📈 SUMMARY:`);
  console.log(`- Income entries from paid invoices in localStorage: ${paidInvoiceIncomes.length}`);
  console.log(`- Paid invoice entries found in table: ${foundInTable}`);
  
  if (paidInvoiceIncomes.length === foundInTable && foundInTable > 0) {
    console.log('✅ SUCCESS: All paid invoice entries are showing in Income Records table!');
    return true;
  } else if (paidInvoiceIncomes.length > 0 && foundInTable === 0) {
    console.log('❌ ISSUE: Paid invoice entries exist in localStorage but not showing in table');
    console.log('💡 Try refreshing the page or switching tabs');
    return false;
  } else {
    console.log('⚠️  PARTIAL: Some paid invoice entries are missing from the table');
    return false;
  }
}

// Test function to mark an invoice as paid and check results
function testMarkAsPaidFlow() {
  console.log('\n🔄 TESTING MARK AS PAID FLOW...');
  
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
    return;
  }
  
  // Find first invoice with "Mark as Paid" option
  const invoiceRows = invoiceTable.querySelectorAll('tbody tr');
  let targetInvoice = null;
  
  for (const row of invoiceRows) {
    const actionsCell = row.querySelector('td:last-child');
    if (actionsCell) {
      const markAsPaidButton = Array.from(actionsCell.querySelectorAll('button')).find(button => 
        button.textContent && button.textContent.includes('Mark as Paid')
      );
      if (markAsPaidButton) {
        targetInvoice = row;
        break;
      }
    }
  }
  
  if (!targetInvoice) {
    console.log('❌ No invoice with "Mark as Paid" option found');
    console.log('💡 All invoices might already be paid');
    return;
  }
  
  console.log('✅ Found invoice with "Mark as Paid" option');
  
  // Get invoice details before marking as paid
  const cells = targetInvoice.querySelectorAll('td');
  const invoiceNumber = cells[0]?.textContent || 'Unknown';
  const clientName = cells[1]?.textContent || 'Unknown';
  const amount = cells[4]?.textContent || '0';
  
  console.log(`📄 Invoice Details: #${invoiceNumber} - ${clientName} - ${amount}`);
  
  // Find and click "Mark as Paid" button
  const markAsPaidButton = Array.from(targetInvoice.querySelectorAll('button')).find(button => 
    button.textContent && button.textContent.includes('Mark as Paid')
  );
  
  if (markAsPaidButton) {
    console.log('🔄 Clicking "Mark as Paid" button...');
    
    // Click the button
    markAsPaidButton.click();
    
    // Wait for processing and then check income records
    setTimeout(() => {
      console.log('\n🔍 CHECKING RESULTS AFTER MARKING AS PAID...');
      testPaidInvoicesInIncomeRecords();
    }, 2000);
  } else {
    console.log('❌ "Mark as Paid" button not found');
  }
}

// Instructions for testing
console.log('\n📝 HOW TO TEST:');
console.log('1. Go to Invoice Records tab');
console.log('2. Find an invoice with "Mark as Paid" option');
console.log('3. Run testMarkAsPaidFlow() to automate the test');
console.log('4. Or manually: Mark invoice as paid → Go to Income Records → Check for new entry');
console.log('5. Run testPaidInvoicesInIncomeRecords() to verify results');

// Auto-check if paid invoices exist
const storedIncomes = localStorage.getItem('farm_incomes');
const localIncomes = storedIncomes ? JSON.parse(storedIncomes) : [];
const paidInvoiceIncomes = localIncomes.filter((income: any) => 
  income.description && income.description.includes('Payment for invoice #')
);

if (paidInvoiceIncomes.length > 0) {
  console.log('\n🚀 Found paid invoice entries, running verification...');
  testPaidInvoicesInIncomeRecords();
} else {
  console.log('\n⏳ No paid invoice entries found');
  console.log('💡 Mark an invoice as paid first, then run testMarkAsPaidFlow()');
}

// Make test functions available globally
window.testPaidInvoicesInIncomeRecords = testPaidInvoicesInIncomeRecords;
window.testMarkAsPaidFlow = testMarkAsPaidFlow;
