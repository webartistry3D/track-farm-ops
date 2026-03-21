// Simple debug script for quantity issue
// Run this in browser console on the inventory page

console.log('🔍 SIMPLE QUANTITY DEBUG');

// Check what's currently displayed in the table
function checkCurrentDisplay() {
  console.log('\n📊 CURRENT TABLE DISPLAY:');
  
  const rows = document.querySelectorAll('tbody tr');
  console.log(`Found ${rows.length} rows`);
  
  rows.forEach((row, index) => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 3) {
      const name = cells[0].textContent?.trim() || '';
      const quantity = cells[2].textContent?.trim() || '';
      
      console.log(`Row ${index + 1}: ${name} -> "${quantity}"`);
      
      if (quantity.includes('0 pieces')) {
        console.log(`  ❌ ISSUE: Showing 0 pieces`);
      } else {
        console.log(`  ✅ OK: Showing correct quantity`);
      }
    }
  });
}

// Check if we're on the right page and if API calls are working
function checkPageAndAPI() {
  console.log('\n🔍 PAGE AND API CHECK:');
  
  // Check if we're on inventory page
  const table = document.querySelector('table');
  if (!table) {
    console.log('❌ Not on inventory page');
    return;
  }
  
  console.log('✅ On inventory page');
  
  // Check if there are any network errors in console
  console.log('💡 Check browser console for any API errors');
  console.log('💡 Look for red error messages in Network tab');
  
  // Check if user is authenticated
  console.log('💡 Make sure you are logged in to the app');
}

// Test creating a new item manually
function testNewItemManual() {
  console.log('\n🧪 MANUAL NEW ITEM TEST:');
  console.log('1. Click "Add New Item" button');
  console.log('2. Fill in:');
  console.log('   Name: Test Item');
  console.log('   Type: CONSUMABLES');
  console.log('   Quantity: 2000');
  console.log('   Unit: pieces');
  console.log('3. Click "Add Item" button');
  console.log('4. Check if new item shows "2,000 pieces"');
  console.log('5. Check browser console for debug logs');
}

// Main debug function
function runSimpleDebug() {
  console.log('🚀 RUNNING SIMPLE DEBUG');
  console.log('========================');
  
  checkCurrentDisplay();
  checkPageAndAPI();
  testNewItemManual();
  
  console.log('\n📋 QUICK TROUBLESHOOTING:');
  console.log('========================');
  console.log('1. If existing items show "0 pieces":');
  console.log('   - Database has old wrong values');
  console.log('   - New items should work correctly');
  console.log('');
  console.log('2. If new items also show "0 pieces":');
  console.log('   - Backend issue still exists');
  console.log('   - Check browser console for errors');
  console.log('');
  console.log('3. If API errors occur:');
  console.log('   - Make sure you are logged in');
  console.log('   - Check Network tab for failed requests');
  console.log('========================');
}

// Run the debug
runSimpleDebug();

// Make function available
window.runSimpleDebug = runSimpleDebug;
window.checkCurrentDisplay = checkCurrentDisplay;
