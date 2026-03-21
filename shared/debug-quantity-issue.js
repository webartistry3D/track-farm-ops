// Debug script to investigate quantity display issue
// Run this in browser console on the inventory page

console.log('🔍 DEBUGGING QUANTITY DISPLAY ISSUE');

// Test function to check API response data
function checkAPIResponse() {
  console.log('\n🧪 CHECKING API RESPONSE DATA...');
  
  // Find if there's an active API call or make one
  const apiCall = fetch('/api/inventory/items')
    .then(response => response.json())
    .then(data => {
      console.log('📤 API RESPONSE DATA:');
      console.log('Response type:', typeof data);
      console.log('Response length:', Array.isArray(data) ? data.length : 'Not array');
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('\n📊 ANALYZING FIRST FEW ITEMS:');
        
        data.slice(0, 3).forEach((item, index) => {
          console.log(`\nItem ${index + 1}:`);
          console.log('  ID:', item.id);
          console.log('  Name:', item.name);
          console.log('  Type:', item.type);
          console.log('  Unit:', item.unit);
          console.log('  Quantity (raw):', item.quantity);
          console.log('  Quantity (type):', typeof item.quantity);
          console.log('  Quantity (Number):', Number(item.quantity));
          console.log('  Quantity (toLocaleString):', Number(item.quantity).toLocaleString());
          console.log('  Full item object:', item);
        });
        
        // Check for quantity patterns
        const zeroItems = data.filter(item => Number(item.quantity) === 0);
        const nonZeroItems = data.filter(item => Number(item.quantity) > 0);
        
        console.log('\n📈 QUANTITY ANALYSIS:');
        console.log(`  Items with quantity 0: ${zeroItems.length}`);
        console.log(`  Items with quantity > 0: ${nonZeroItems.length}`);
        
        if (zeroItems.length > 0) {
          console.log('\n❌ ITEMS SHOWING 0:');
          zeroItems.forEach(item => {
            console.log(`  - ${item.name}: ${item.quantity} ${item.unit}`);
          });
        }
        
        if (nonZeroItems.length > 0) {
          console.log('\n✅ ITEMS WITH CORRECT QUANTITY:');
          nonZeroItems.forEach(item => {
            console.log(`  - ${item.name}: ${Number(item.quantity).toLocaleString()} ${item.unit}`);
          });
        }
      }
    })
    .catch(error => {
      console.error('❌ API ERROR:', error);
    });
  
  return apiCall;
}

// Test function to check what's actually displayed in the table
function checkTableDisplay() {
  console.log('\n🧪 CHECKING TABLE DISPLAY...');
  
  const table = document.querySelector('table');
  if (!table) {
    console.log('❌ Table not found');
    return;
  }
  
  const tbody = table.querySelector('tbody');
  const rows = tbody ? tbody.querySelectorAll('tr') : [];
  
  console.log(`Found ${rows.length} rows in table`);
  
  rows.forEach((row, index) => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 5) {
      const nameCell = cells[0];
      const quantityCell = cells[2];
      
      const itemName = nameCell.textContent?.trim() || '';
      const quantityText = quantityCell.textContent?.trim() || '';
      
      console.log(`\nRow ${index + 1}: ${itemName}`);
      console.log(`  Displayed: "${quantityText}"`);
      
      // Extract numeric value
      const quantityMatch = quantityText.match(/([\d,]+(?:\.\d+)?)/);
      const displayedQuantity = quantityMatch ? quantityMatch[1] : null;
      const numericQuantity = displayedQuantity ? parseInt(displayedQuantity.replace(/,/g, '')) : null;
      
      console.log(`  Numeric value: ${numericQuantity}`);
      
      if (numericQuantity === 0) {
        console.log(`  ❌ ISSUE: Showing 0 instead of actual quantity`);
      } else if (numericQuantity && numericQuantity > 0) {
        console.log(`  ✅ OK: Showing ${numericQuantity.toLocaleString()}`);
      }
    }
  });
}

// Test function to create a new item and see if it displays correctly
function testNewItemCreation() {
  console.log('\n🧪 TESTING NEW ITEM CREATION...');
  
  // Find the Add New Item form
  const addForm = document.querySelector('form');
  if (!addForm) {
    console.log('❌ Add New Item form not found');
    return;
  }
  
  console.log('✅ Add New Item form found');
  console.log('💡 To test new item creation:');
  console.log('1. Fill the form with quantity "2000"');
  console.log('2. Submit the form');
  console.log('3. Check if the new item shows "2,000 pieces"');
  console.log('4. Check browser console for submission debug logs');
}

// Main debug runner
function runQuantityDebug() {
  console.log('🚀 STARTING QUANTITY ISSUE DEBUG');
  console.log('==================================');
  
  checkAPIResponse();
  setTimeout(() => {
    checkTableDisplay();
    testNewItemCreation();
  }, 1000);
  
  console.log('\n📋 DEBUG STEPS:');
  console.log('1. Checking API response data');
  console.log('2. Analyzing table display');
  console.log('3. Providing new item creation guidance');
  
  console.log('\n💡 POSSIBLE CAUSES:');
  console.log('- Existing database items have incorrect quantity values');
  console.log('- Backend still returning 0 for some items');
  console.log('- Frontend display logic not working correctly');
  console.log('- Database default value overriding input');
  
  console.log('==================================');
}

// Instructions
console.log('\n📝 HOW TO USE:');
console.log('1. Go to Inventory Items page');
console.log('2. Run runQuantityDebug() to analyze the issue');
console.log('3. Check API response vs table display');
console.log('4. Test creating a new item to see if fix works');

// Auto-run if on inventory page
const table = document.querySelector('table');
if (table) {
  console.log('\n🚀 Inventory page found, running debug...');
  runQuantityDebug();
} else {
  console.log('\n⏳ Not on inventory page');
  console.log('💡 Navigate to Inventory Items tab first');
}

// Make debug function available globally
window.runQuantityDebug = runQuantityDebug;
window.checkAPIResponse = checkAPIResponse;
window.checkTableDisplay = checkTableDisplay;
window.testNewItemCreation = testNewItemCreation;
