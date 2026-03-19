// Cleanup function to remove income entries from localStorage
function cleanupLocalStorage() {
  console.log('🧹 Cleaning up localStorage income entries...');
  
  // Remove old farm_incomes data if it exists
  const storedIncomes = localStorage.getItem('farm_incomes');
  if (storedIncomes) {
    const localIncomes = JSON.parse(storedIncomes);
    console.log(`Found ${localIncomes.length} income entries in localStorage - removing them`);
    localStorage.removeItem('farm_incomes');
    console.log('✅ Removed farm_incomes from localStorage');
  } else {
    console.log('✅ No income entries found in localStorage');
  }
  
  // Keep invoices and other data intact
  const storedInvoices = localStorage.getItem('farm_invoices');
  if (storedInvoices) {
    const invoices = JSON.parse(storedInvoices);
    console.log(`✅ Keeping ${invoices.length} invoices in localStorage`);
  }
}

// Run the cleanup
cleanupLocalStorage();
