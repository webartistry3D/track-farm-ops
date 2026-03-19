const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugAccess() {
  try {
    console.log('🔍 COMPREHENSIVE ACCESS DEBUG');
    console.log('================================');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdBy: true
      }
    });

    console.log('\n📋 ALL USERS:');
    users.forEach(user => {
      console.log(`  ${user.role} ${user.name} (ID: ${user.id}, createdBy: ${user.createdBy})`);
    });

    // Get all invoices
    const invoices = await prisma.invoice.findMany({
      select: {
        id: true,
        invoiceNumber: true,
        userId: true,
        createdBy: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdBy: true
          }
        }
      }
    });

    console.log('\n📄 ALL INVOICES:');
    invoices.forEach(invoice => {
      console.log(`  Invoice ${invoice.id} (${invoice.invoiceNumber})`);
      console.log(`    Created by: ${invoice.user?.name} (${invoice.user?.role})`);
      console.log(`    User ID: ${invoice.userId}`);
      console.log(`    Created By: ${invoice.createdBy}`);
      console.log(`    User Created By: ${invoice.user?.createdBy}`);
    });

    // Get all income entries
    const incomeEntries = await prisma.incomeEntry.findMany({
      select: {
        id: true,
        amount: true,
        userId: true,
        createdBy: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdBy: true
          }
        }
      }
    });

    console.log('\n💰 ALL INCOME ENTRIES:');
    incomeEntries.forEach(entry => {
      console.log(`  Income Entry ${entry.id} (${entry.amount})`);
      console.log(`    Created by: ${entry.user?.name} (${entry.user?.role})`);
      console.log(`    User ID: ${entry.userId}`);
      console.log(`    Created By: ${entry.createdBy}`);
      console.log(`    User Created By: ${entry.user?.createdBy}`);
    });

    // Get all expense entries
    const expenseEntries = await prisma.expenseEntry.findMany({
      select: {
        id: true,
        amount: true,
        userId: true,
        createdBy: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdBy: true
          }
        }
      }
    });

    console.log('\n💸 ALL EXPENSE ENTRIES:');
    expenseEntries.forEach(entry => {
      console.log(`  Expense Entry ${entry.id} (${entry.amount})`);
      console.log(`    Created by: ${entry.user?.name} (${entry.user?.role})`);
      console.log(`    User ID: ${entry.userId}`);
      console.log(`    Created By: ${entry.createdBy}`);
      console.log(`    User Created By: ${entry.user?.createdBy}`);
    });

    console.log('\n✅ DEBUG COMPLETE');
    console.log('Check the backend logs for detailed access control debugging');

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAccess();
