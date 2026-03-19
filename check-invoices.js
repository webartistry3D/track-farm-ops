// Check invoice data in localStorage
console.log('🔍 Checking invoice data in localStorage...');

const storedInvoices = localStorage.getItem('farm_invoices');
const allInvoices = storedInvoices ? JSON.parse(storedInvoices) : [];

console.log(`\n📊 Found ${allInvoices.length} invoices in localStorage:`);

allInvoices.forEach((invoice, index) => {
  console.log(`  ${index + 1}. Invoice ID: ${invoice.id}`);
  console.log(`     Invoice Number: ${invoice.invoiceNumber}`);
  console.log(`     Client: ${invoice.clientName}`);
  console.log(`     Amount: ₦${invoice.total}`);
  console.log(`     Status: ${invoice.status}`);
  console.log(`     Created: ${invoice.createdAt}`);
  console.log(`     Created By: ${invoice.createdBy || 'NOT SPECIFIED'}`);
  console.log(`     User ID: ${invoice.userId || 'NOT SPECIFIED'}`);
  console.log('');
});

// Check for user-based filtering
console.log('👥 User Access Analysis:');
const userGroups = {};
allInvoices.forEach(invoice => {
  const userKey = invoice.createdBy || invoice.userId || 'Unknown';
  if (!userGroups[userKey]) {
    userGroups[userKey] = { count: 0, invoices: [] };
  }
  userGroups[userKey].count++;
  userGroups[userKey].invoices.push(invoice);
});

Object.entries(userGroups).forEach(([user, data]) => {
  console.log(`  ${user}: ${data.count} invoices`);
  data.invoices.forEach(inv => {
    console.log(`    - ${inv.invoiceNumber} (${inv.clientName})`);
  });
});
