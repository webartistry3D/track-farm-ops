const fetch = require('node-fetch');

async function testIncomeNotification() {
  console.log('🧪 Starting income notification test...');
  
  // Test with WORKER account (since that's what the user was testing with)
  const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'kelechi@worker.com',
      password: 'Password123#'
    })
  });

  if (!loginResponse.ok) {
    console.error('❌ Login failed:', await loginResponse.text());
    return;
  }

  const loginData = await loginResponse.json();
  const token = loginData.token;
  console.log('✅ Login successful, token obtained');

  // Create income entry
  const incomeData = {
    amount: "100000",
    description: "Test Income for Notification Debug",
    quantity: "1",
    unitPrice: "100000",
    vatRate: 7.5,
    vatAmount: 0,
    totalAmount: "100000",
    date: "2026-06-07",
    enableVAT: false,
    category: "Grants",
    paymentMethod: "TRANSFER",
    subtotal: "100000"
  };

  console.log('📤 Creating income entry...');
  const incomeResponse = await fetch('http://localhost:3001/api/finance/income', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(incomeData)
  });

  if (!incomeResponse.ok) {
    console.error('❌ Income creation failed:', await incomeResponse.text());
    return;
  }

  const incomeResult = await incomeResponse.json();
  console.log('✅ Income entry created successfully:', incomeResult);
  console.log('🔍 Check backend console for debug logs:');
  console.log('   - 🚨 createIncomeEntry FUNCTION CALLED');
  console.log('   - 🔔 About to call createActivityNotification for INCOME_CREATED');
  console.log('   - 🔔 Notification Debug: Actor role = ...');
}

testIncomeNotification().catch(console.error);
