import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCategories() {
  try {
    console.log('🔍 Checking inventory categories in database...');
    
    // Count all inventory categories
    const totalCategories = await prisma.inventoryCategory.count();
    console.log(`📊 Total inventory categories: ${totalCategories}`);
    
    // Get all inventory categories with their organizations
    const allCategories = await prisma.inventoryCategory.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            items: true
          }
        }
      }
    });
    
    console.log('\n📋 All inventory categories:');
    allCategories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} (${category.icon})`);
      console.log(`   Organization: ${category.organization?.name || 'None'}`);
      console.log(`   Items: ${category._count.items}`);
      console.log(`   Description: ${category.description || 'None'}`);
      console.log('');
    });
    
    // Check categories by organization
    const kelechiFarms = await prisma.organization.findFirst({
      where: { name: 'Kelechi Farms' }
    });
    
    const nnennaFarms = await prisma.organization.findFirst({
      where: { name: 'Nnenna Farms' }
    });
    
    if (kelechiFarms) {
      const kelechiCategories = await prisma.inventoryCategory.findMany({
        where: { organizationId: kelechiFarms.id },
        include: {
          _count: {
            select: {
              items: true
            }
          }
        }
      });
      
      console.log(`🏢 Kelechi Farms Categories (${kelechiCategories.length}):`);
      kelechiCategories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name} - ${cat._count.items} items`);
      });
    }
    
    if (nnennaFarms) {
      const nnennaCategories = await prisma.inventoryCategory.findMany({
        where: { organizationId: nnennaFarms.id },
        include: {
          _count: {
            select: {
              items: true
            }
          }
        }
      });
      
      console.log(`\n🏢 Nnenna Farms Categories (${nnennaCategories.length}):`);
      nnennaCategories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name} - ${cat._count.items} items`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
