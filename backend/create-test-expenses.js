const { PrismaClient } = require('@prisma/client');

async function createTestExpenses() {
  console.log('🔧 Creating test expense records...\n');
  
  const prisma = new PrismaClient();
  
  try {
    // Get a test user and their organization
    const testUser = await prisma.user.findFirst({
      select: { 
        id: true, 
        name: true,
        organizationId: true
      }
    });

    if (!testUser) {
      console.log('❌ No users found in database. Please create a user first.');
      return;
    }

    console.log(`👤 Using test user: ${testUser.name} (ID: ${testUser.id})`);
    console.log(`🏢 Organization ID: ${testUser.organizationId}`);

    if (!testUser.organizationId) {
      console.log('❌ User has no organization. Please assign an organization to the user first.');
      return;
    }

    // Create test expense records
    const testExpenses = [
      {
        amount: 150.00,
        category: 'Feed',
        note: 'Chicken feed for layers',
        date: new Date('2026-03-15'),
        merchant: 'Farm Supply Store',
        organization: {
          connect: { id: testUser.organizationId }
        },
        user: {
          connect: { id: testUser.id }
        }
      },
      {
        amount: 75.50,
        category: 'Equipment',
        note: 'Water pump replacement',
        date: new Date('2026-03-14'),
        merchant: 'Hardware Store',
        organization: {
          connect: { id: testUser.organizationId }
        },
        user: {
          connect: { id: testUser.id }
        }
      },
      {
        amount: 320.00,
        category: 'Veterinary',
        note: 'Vaccination supplies',
        date: new Date('2026-03-13'),
        merchant: 'Veterinary Clinic',
        organization: {
          connect: { id: testUser.organizationId }
        },
        user: {
          connect: { id: testUser.id }
        }
      },
      {
        amount: 45.00,
        category: 'Utilities',
        note: 'Electricity bill',
        date: new Date('2026-03-12'),
        merchant: 'Electric Company',
        organization: {
          connect: { id: testUser.organizationId }
        },
        user: {
          connect: { id: testUser.id }
        }
      },
      {
        amount: 89.99,
        category: 'Feed',
        note: 'Organic chicken feed',
        date: new Date('2026-03-10'),
        merchant: 'Organic Farm Supply',
        organization: {
          connect: { id: testUser.organizationId }
        },
        user: {
          connect: { id: testUser.id }
        }
      }
    ];

    console.log(`\n📝 Creating ${testExpenses.length} test expense records...`);

    for (const expense of testExpenses) {
      const created = await prisma.expenseEntry.create({
        data: expense
      });
      console.log(`✅ Created: ${created.description} - $${created.amount} (${created.category})`);
    }

    console.log(`\n🎉 Successfully created ${testExpenses.length} test expense records!`);
    
    // Verify the records were created
    const totalExpenses = await prisma.expenseEntry.count({
      where: { userId: testUser.id }
    });
    console.log(`📊 Total expense records for user: ${totalExpenses}`);

  } catch (error) {
    console.error('❌ Error creating test expenses:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestExpenses();
