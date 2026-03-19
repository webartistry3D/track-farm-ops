import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkInventory() {
  try {
    console.log('🔍 Checking inventory items in database...');
    
    // Count all inventory items
    const totalItems = await prisma.inventoryItem.count();
    console.log(`📊 Total inventory items: ${totalItems}`);
    
    // Get all inventory items
    const allItems = await prisma.inventoryItem.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    console.log('📋 All inventory items:');
    allItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (${item.type}) - Qty: ${item.quantity} ${item.unit}`);
      console.log(`   Organization: ${item.organization?.name || 'None'}`);
      console.log(`   Category: ${item.category?.name || 'None'}`);
      console.log(`   Created: ${item.createdAt}`);
      console.log('');
    });
    
    // Check organizations
    const organizations = await prisma.organization.findMany();
    console.log(`🏢 Total organizations: ${organizations.length}`);
    organizations.forEach((org, index) => {
      console.log(`${index + 1}. ${org.name} (ID: ${org.id})`);
    });
    
    // Check users with organizations
    const usersWithOrgs = await prisma.user.findMany({
      where: { organizationId: { not: null } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    console.log(`👥 Users with organizations: ${usersWithOrgs.length}`);
    usersWithOrgs.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role} in ${user.organization?.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking inventory:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInventory();
