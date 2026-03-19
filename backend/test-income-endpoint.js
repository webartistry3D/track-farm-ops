const api = require('../lib/api');

async function testIncomeEndpoint() {
  console.log('🧪 Testing Income Endpoint...\n');
  
  try {
    console.log('📡 Testing GET /finance/income...');
    const response = await api.get('/finance/income');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    if (response.data && response.data.entries) {
      console.log(`✅ Found ${response.data.entries.length} income records`);
      if (response.data.entries.length > 0) {
        console.log('📊 First record:', response.data.entries[0]);
      }
    } else {
      console.log('❌ No income records found');
    }
    
  } catch (error) {
    console.error('❌ Endpoint test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testIncomeEndpoint();
