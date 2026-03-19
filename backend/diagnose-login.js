const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function diagnoseLoginSystem() {
  console.log('🔍 Diagnosing Login System...\n');
  
  try {
    // Check database connection
    console.log('1. Checking database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully\n');
    
    // Check existing users
    console.log('2. Checking existing users...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        createdAt: true,
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
      console.log(`     Organization: ${user.organization?.name || 'None'} (${user.organizationId})`);
      console.log(`     Created: ${user.createdAt}`);
      console.log('');
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('💡 You need to create test users first.');
      
      console.log('\n3. Creating test users...');
      const testUsers = [
        {
          name: 'Farm Owner',
          email: 'owner@trackfarmops.com',
          password: 'password123',
          role: 'OWNER'
        },
        {
          name: 'Farm Manager',
          email: 'manager@trackfarmops.com',
          password: 'password123',
          role: 'MANAGER'
        },
        {
          name: 'Farm Worker',
          email: 'worker@trackfarmops.com',
          password: 'password123',
          role: 'WORKER'
        }
      ];
      
      for (const testUser of testUsers) {
        const hashedPassword = await bcrypt.hash(testUser.password, 12);
        
        // Create organization first
        const organization = await prisma.organization.create({
          data: {
            name: `${testUser.name}'s Farm`
          }
        });
        
        // Create user
        const user = await prisma.user.create({
          data: {
            name: testUser.name,
            email: testUser.email,
            password: hashedPassword,
            role: testUser.role,
            organizationId: organization.id
          },
          include: {
            organization: true
          }
        });
        
        console.log(`✅ Created user: ${user.name} (${user.email}) with password: ${testUser.password}`);
        console.log(`   Organization: ${user.organization.name}`);
        console.log('');
      }
      
      console.log('✅ Test users created successfully!');
      console.log('\n📋 Login Credentials:');
      console.log('Owner: owner@trackfarmops.com / password123');
      console.log('Manager: manager@trackfarmops.com / password123');
      console.log('Worker: worker@trackfarmops.com / password123');
    } else {
      console.log('3. Testing password verification...');
      // Test password verification for first user
      const testUser = users[0];
      const testPassword = 'password123';
      
      console.log(`Testing user: ${testUser.email}`);
      
      // Check if password matches common test passwords
      const commonPasswords = ['password123', 'password', '123456', 'admin'];
      let passwordMatch = false;
      
      for (const password of commonPasswords) {
        const isValid = await bcrypt.compare(password, testUser.password);
        if (isValid) {
          console.log(`✅ Password matches: ${password}`);
          passwordMatch = true;
          break;
        }
      }
      
      if (!passwordMatch) {
        console.log('❌ No common test passwords match this user');
        console.log('💡 You may need to use a different password or reset the user password');
      }
    }
    
    console.log('\n4. Checking JWT Secret...');
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    console.log(`JWT Secret: ${jwtSecret === 'fallback-secret' ? 'Using fallback (development)' : 'Using environment secret'}`);
    
    console.log('\n🎯 Login System Diagnosis Complete!');
    console.log('\n📝 Next Steps:');
    console.log('1. Make sure your backend server is running (npm run dev)');
    console.log('2. Check the console logs when you try to login');
    console.log('3. Use the test credentials provided above');
    console.log('4. Check browser network tab for API requests');
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseLoginSystem();
