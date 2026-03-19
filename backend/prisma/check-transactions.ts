import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndResetTransactions() {
  console.log('🔍 Checking inventory transactions...');

  try {
    // Check existing transactions by joining with inventory items
    const transactions = await prisma.inventoryTransaction.findMany({
      where: {
        inventoryItem: {
          organizationId: 1
        }
      },
      include: {
        inventoryItem: {
          select: {
            name: true,
            quantity: true
          }
        }
      }
    });

    console.log(`📊 Found ${transactions.length} transactions`);

    if (transactions.length > 0) {
      console.log('\n📋 Sample transactions:');
      transactions.slice(0, 3).forEach(tx => {
        console.log(`  ${tx.inventoryItem.name}: ${tx.quantityChange} (${tx.reason})`);
      });

      // Reset all transactions to zero for clean start
      const deleteResult = await prisma.inventoryTransaction.deleteMany({
        where: {
          inventoryItem: {
            organizationId: 1
          }
        }
      });

      console.log(`\n🗑️ Deleted ${deleteResult.count} transactions for clean start`);
    } else {
      console.log('✅ No transactions found - clean state');
    }

    // Verify final state
    const finalItems = await prisma.inventoryItem.findMany({
      where: { organizationId: 1 },
      select: {
        name: true,
        quantity: true,
        metadata: true,
        _count: {
          select: {
            transactions: true
          }
        }
      }
    });

    console.log('\n🎯 Final verification:');
    console.log(`  Total items: ${finalItems.length}`);
    
    const totalQuantity = finalItems.reduce((sum, item) => sum + Number(item.quantity), 0);
    const totalValue = finalItems.reduce((sum, item) => {
      const metadata = item.metadata as any;
      const price = metadata?.pricePerUnit || 0;
      return sum + (Number(item.quantity) * Number(price));
    }, 0);
    
    console.log(`  Total quantity: ${totalQuantity}`);
    console.log(`  Total value: ₦${totalValue.toLocaleString()}`);
    console.log(`  Average value: ₦${totalQuantity > 0 ? (totalValue / totalQuantity).toLocaleString() : '0.00'}`);
    
    const zeroQuantityItems = finalItems.filter(item => Number(item.quantity) === 0);
    console.log(`  Items with zero quantity: ${zeroQuantityItems.length}/${finalItems.length}`);

    return true;
  } catch (error) {
    console.error('❌ Error checking transactions:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
if (require.main === module) {
  checkAndResetTransactions();
}

export { checkAndResetTransactions };
