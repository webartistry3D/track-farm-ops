// Import the formatCurrency function directly
const { formatCurrency } = require('../src/utils/currency');

async function testCurrencyFormatting() {
  console.log('🧪 Testing Currency Formatting Behavior...\n');
  
  try {
    // Test 1: Large number formatting
    console.log('\n📊 Test 1: Large number (50,000)');
    const largeNumber = 50000;
    const formattedLarge = formatCurrency(largeNumber);
    console.log('   Input:', largeNumber);
    console.log('   Output:', formattedLarge);
    console.log('   Expected: ₦50,000.00');
    
    // Test 2: Medium number formatting
    console.log('\n📊 Test 2: Medium number (1,500)');
    const mediumNumber = 1500;
    const formattedMedium = formatCurrency(mediumNumber);
    console.log('   Input:', mediumNumber);
    console.log('   Output:', formattedMedium);
    console.log('   Expected: ₦1,500.00');
    
    // Test 3: Small number formatting
    console.log('\n📊 Test 3: Small number (50)');
    const smallNumber = 50;
    const formattedSmall = formatCurrency(smallNumber);
    console.log('   Input:', smallNumber);
    console.log('   Output:', formattedSmall);
    console.log('   Expected: ₦50.00');
    
    // Test 4: Check what happens with invalid input
    console.log('\n📊 Test 4: Invalid input');
    const invalidInput = 'abc';
    const formattedInvalid = formatCurrency(invalidInput);
    console.log('   Input:', invalidInput);
    console.log('   Output:', formattedInvalid);
    console.log('   Expected: ₦0.00');
    
    console.log('\n✅ Currency formatting test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCurrencyFormatting();
