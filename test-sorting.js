// Test script to verify sorting order for Income Records and Invoice Records
// Run this in browser console after refreshing

console.log('🔄 TESTING SORTING ORDER - NEWEST FIRST');

// Test Income Records sorting
function testIncomeRecordsSorting() {
  console.log('\n📊 TESTING INCOME RECORDS SORTING:');
  
  const incomeRecords = document.querySelectorAll('[data-testid="income-records-table"] tr, table tbody tr');
  
  if (incomeRecords.length === 0) {
    console.log('❌ No income records found');
    return false;
  }
  
  console.log(`Found ${incomeRecords.length} income records`);
  
  // Extract dates from income records (assuming date is in first column or has a date element)
  const dates = [];
  incomeRecords.forEach((row, index) => {
    const dateText = row.querySelector('td')?.textContent || '';
    const dateMatch = dateText.match(/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}/);
    if (dateMatch) {
      dates.push({
        index: index + 1,
        date: dateMatch[0],
        timestamp: new Date(dateMatch[0]).getTime()
      });
    }
  });
  
  if (dates.length < 2) {
    console.log('❌ Not enough date records to test sorting');
    return false;
  }
  
  console.log('📅 Dates found:', dates);
  
  // Check if dates are in descending order (newest first)
  let isSortedCorrectly = true;
  for (let i = 0; i < dates.length - 1; i++) {
    if (dates[i].timestamp < dates[i + 1].timestamp) {
      isSortedCorrectly = false;
      console.log(`❌ Sort error: Row ${dates[i].index} (${dates[i].date}) should be after Row ${dates[i + 1].index} (${dates[i + 1].date})`);
      break;
    }
  }
  
  if (isSortedCorrectly) {
    console.log('✅ Income Records are correctly sorted (newest first)');
  }
  
  return isSortedCorrectly;
}

// Test Invoice Records sorting
function testInvoiceRecordsSorting() {
  console.log('\n📄 TESTING INVOICE RECORDS SORTING:');
  
  // Look for invoice records table
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
    return false;
  }
  
  const invoiceRows = invoiceTable.querySelectorAll('tbody tr');
  console.log(`Found ${invoiceRows.length} invoice records`);
  
  // Extract dates from invoice records
  const dates = [];
  invoiceRows.forEach((row, index) => {
    const cells = row.querySelectorAll('td');
    cells.forEach(cell => {
      const dateText = cell.textContent || '';
      const dateMatch = dateText.match(/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}/);
      if (dateMatch) {
        dates.push({
          index: index + 1,
          date: dateMatch[0],
          timestamp: new Date(dateMatch[0]).getTime()
        });
      }
    });
  });
  
  if (dates.length < 2) {
    console.log('❌ Not enough date records to test sorting');
    return false;
  }
  
  console.log('📅 Dates found:', dates);
  
  // Check if dates are in descending order (newest first)
  let isSortedCorrectly = true;
  for (let i = 0; i < dates.length - 1; i++) {
    if (dates[i].timestamp < dates[i + 1].timestamp) {
      isSortedCorrectly = false;
      console.log(`❌ Sort error: Row ${dates[i].index} (${dates[i].date}) should be after Row ${dates[i + 1].index} (${dates[i + 1].date})`);
      break;
    }
  }
  
  if (isSortedCorrectly) {
    console.log('✅ Invoice Records are correctly sorted (newest first)');
  }
  
  return isSortedCorrectly;
}

// Test localStorage sorting directly
function testLocalStorageSorting() {
  console.log('\n💾 TESTING LOCALSTORAGE SORTING:');
  
  // Test incomes
  const storedIncomes = localStorage.getItem('farm_incomes');
  if (storedIncomes) {
    const incomes = JSON.parse(storedIncomes);
    console.log(`Found ${incomes.length} incomes in localStorage`);
    
    const sortedIncomes = incomes.sort((a, b) => 
      new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
    );
    
    console.log('📊 First 3 incomes (newest first):');
    sortedIncomes.slice(0, 3).forEach((income, index) => {
      console.log(`  ${index + 1}. ${income.createdAt || income.date} - ${income.description}`);
    });
  }
  
  // Test invoices
  const storedInvoices = localStorage.getItem('farm_invoices');
  if (storedInvoices) {
    const invoices = JSON.parse(storedInvoices);
    console.log(`Found ${invoices.length} invoices in localStorage`);
    
    const sortedInvoices = invoices.sort((a, b) => 
      new Date(b.createdAt || b.invoiceDate).getTime() - new Date(a.createdAt || b.invoiceDate).getTime()
    );
    
    console.log('📄 First 3 invoices (newest first):');
    sortedInvoices.slice(0, 3).forEach((invoice, index) => {
      console.log(`  ${index + 1}. ${invoice.createdAt || invoice.invoiceDate} - ${invoice.invoiceNumber || invoice.clientName}`);
    });
  }
}

// Run all tests
console.log('🚀 STARTING SORTING TESTS...');

setTimeout(() => {
  const incomeResult = testIncomeRecordsSorting();
  const invoiceResult = testInvoiceRecordsSorting();
  testLocalStorageSorting();
  
  console.log('\n🎯 SUMMARY:');
  console.log(`Income Records Sorting: ${incomeResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Invoice Records Sorting: ${invoiceResult ? '✅ PASS' : '❌ FAIL'}`);
  
  if (incomeResult && invoiceResult) {
    console.log('\n🎉 BOTH TABLES ARE CORRECTLY SORTED (NEWEST FIRST)!');
  } else {
    console.log('\n⚠️  SOME TABLES NEED SORTING FIXES');
  }
}, 1000);
