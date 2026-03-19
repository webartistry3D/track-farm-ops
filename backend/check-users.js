const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserInconsistency() {
  try {
    console.log('🔍 Checking user records and income entries...\n');

    // Get all users
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' }
    });

    console.log('📋 All Users:');
    users.forEach(user => {
      console.log(`  ID: ${user.id}, Name: "${user.name}", Email: ${user.email}, Role: ${user.role}`);
    });

    // Get all income entries with user info
    const incomeEntries = await prisma.incomeEntry.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log('\n💰 Income Entries with User Info:');
    incomeEntries.forEach(entry => {
      console.log(`  Entry ID: ${entry.id}, Amount: ₦${entry.amount}, User ID: ${entry.userId}, User Name: "${entry.user?.name}", User Email: ${entry.user?.email}`);
    });

    // Check for potential duplicates or inconsistencies
    console.log('\n🔍 Checking for inconsistencies...');
    
    const userMap = new Map();
    users.forEach(user => {
      const emailKey = user.email.toLowerCase();
      if (!userMap.has(emailKey)) {
        userMap.set(emailKey, []);
      }
      userMap.get(emailKey).push(user);
    });

    // Find users with same email but different names
    let foundInconsistencies = false;
    userMap.forEach((userList, email) => {
      if (userList.length > 1) {
        console.log(`❌ Found multiple users with email ${email}:`);
        userList.forEach(user => {
          console.log(`    ID: ${user.id}, Name: "${user.name}"`);
        });
        foundInconsistencies = true;
      }
    });

    // Check for similar names that might be the same person
    const nameGroups = new Map();
    users.forEach(user => {
      const nameKey = user.name.toLowerCase().replace(/\s+/g, ' ').trim();
      if (!nameGroups.has(nameKey)) {
        nameGroups.set(nameKey, []);
      }
      nameGroups.get(nameKey).push(user);
    });

    console.log('\n👥 Checking for similar names...');
    const similarNames = [];
    users.forEach(user1 => {
      users.forEach(user2 => {
        if (user1.id !== user2.id) {
          const name1 = user1.name.toLowerCase();
          const name2 = user2.name.toLowerCase();
          
          // Check if one name is contained in the other or they're very similar
          if (name1.includes(name2) || name2.includes(name1) || 
              (name1.split(' ')[0] === name2.split(' ')[0] && name1.split(' ')[0].length > 2)) {
            similarNames.push({ user1, user2 });
          }
        }
      });
    });

    // Remove duplicates and display similar names
    const uniqueSimilar = new Set();
    similarNames.forEach(pair => {
      const key = `${pair.user1.id}-${pair.user2.id}`;
      const reverseKey = `${pair.user2.id}-${pair.user1.id}`;
      if (!uniqueSimilar.has(key) && !uniqueSimilar.has(reverseKey)) {
        uniqueSimilar.add(key);
        console.log(`⚠️  Potentially same user:`);
        console.log(`    User 1: ID ${pair.user1.id}, Name: "${pair.user1.name}", Email: ${pair.user1.email}`);
        console.log(`    User 2: ID ${pair.user2.id}, Name: "${pair.user2.name}", Email: ${pair.user2.email}`);
      }
    });

    if (!foundInconsistencies && uniqueSimilar.size === 0) {
      console.log('✅ No user inconsistencies found.');
    }

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserInconsistency();
