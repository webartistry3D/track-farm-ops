// Check localStorage data for inconsistencies
console.log('🔍 Checking localStorage income entries...');

const storedIncomes = localStorage.getItem('farm_incomes');
const localIncomes = storedIncomes ? JSON.parse(storedIncomes) : [];

console.log(`\n📊 Found ${localIncomes.length} income entries in localStorage:`);

localIncomes.forEach((entry, index) => {
  console.log(`  ${index + 1}. Entry ID: ${entry.id}`);
  console.log(`     Amount: ₦${entry.amount}`);
  console.log(`     Description: ${entry.description}`);
  console.log(`     User ID: ${entry.userId}`);
  console.log(`     User Name: "${entry.user?.name}"`);
  console.log(`     Created: ${entry.createdAt}`);
  console.log('');
});

// Group by user to see inconsistencies
const userGroups = {};
localIncomes.forEach(entry => {
  const userId = entry.userId;
  if (!userGroups[userId]) {
    userGroups[userId] = {
      userId,
      names: new Set(),
      entries: []
    };
  }
  userGroups[userId].names.add(entry.user?.name);
  userGroups[userId].entries.push(entry);
});

console.log('👥 User Group Analysis:');
Object.values(userGroups).forEach(group => {
  console.log(`\n  User ID: ${group.userId}`);
  console.log(`  Unique Names (${group.names.size}):`);
  group.names.forEach(name => console.log(`    - "${name}"`));
  if (group.names.size > 1) {
    console.log('  ❌ INCONSISTENCY DETECTED!');
  }
});
