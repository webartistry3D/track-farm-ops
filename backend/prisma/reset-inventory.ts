import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetInventoryToZero() {
  console.log('🔄 Resetting all inventory items to zero quantity and value...');

  try {
    // Reset all items in the test organization (ID: 1) to zero quantity and null price
    const result = await prisma.inventoryItem.updateMany({
      where: {
        organizationId: 1
      },
      data: {
        quantity: 0,
        initialQuantity: 0,
        metadata: {
          pricePerUnit: null,
          location: null,
          supplier: null,
          purchaseDate: null,
          expiryDate: null,
          minimumStock: null,
          notes: 'Reset to zero for first-time users'
        }
      }
    });

    console.log(`✅ Reset ${result.count} inventory items to zero`);

    // Verify the reset
    const items = await prisma.inventoryItem.findMany({
      where: { organizationId: 1 },
      select: {
        name: true,
        quantity: true,
        metadata: true
      }
    });

    console.log('\n📊 Verification - Sample items:');
    items.slice(0, 5).forEach(item => {
      const metadata = item.metadata as any;
      const price = metadata?.pricePerUnit || 0;
      console.log(`  ${item.name}: ${item.quantity} ${price ? '₦' + Number(price).toLocaleString() : '₦0.00'}`);
    });

    console.log(`\n🎯 All ${items.length} items now have 0 quantity and ₦0.00 value`);

    return true;
  } catch (error) {
    console.error('❌ Error resetting inventory:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset
if (require.main === module) {
  resetInventoryToZero();
}

export { resetInventoryToZero };
