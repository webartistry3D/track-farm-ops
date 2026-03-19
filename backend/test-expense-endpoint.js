const api = require('./lib/api');

async function testExpenseEndpoint() {
  console.log('🧪 Testing Expense Endpoint...\n');
  
  try {
    console.log('📡 Testing GET /finance/expenses...');
    const response = await api.get('/finance/expenses');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    if (response.data && response.data.entries) {
      console.log(`✅ Found ${response.data.entries.length} expense records`);
      if (response.data.entries.length > 0) {
        console.log('📊 First record:', response.data.entries[0]);
      }
    } else {
      console.log('❌ No expense records found');
    }
    
  } catch (error) {
    console.error('❌ Endpoint test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testExpenseEndpoint();
