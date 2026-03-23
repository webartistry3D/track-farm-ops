const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prodPrisma = new PrismaClient();

async function importDevDataToProduction() {
  try {
    console.log('📥 Importing development data to production...\n');
    
    // Read the exported data
    const data = JSON.parse(fs.readFileSync('dev-data-export.json', 'utf8'));
    
    // 1. Import Organizations
    console.log('🏢 Importing Organizations...');
    for (const org of data.organizations) {
      const existing = await prodPrisma.organization.findFirst({
        where: { name: org.name }
      });
      
      if (!existing) {
        await prodPrisma.organization.create({
          data: {
            name: org.name,
            description: org.description
          }
        });
        console.log(`✅ Created: ${org.name}`);
      } else {
        console.log(`⏭️ Exists: ${org.name}`);
      }
    }
    
    // Get production org mapping
    const prodOrgs = await prodPrisma.organization.findMany();
    const orgMap = {};
    prodOrgs.forEach(org => {
      orgMap[org.name] = org.id;
    });
    
    // 2. Import Inventory Categories
    console.log('\n📂 Importing Inventory Categories...');
    for (const category of data.inventoryCategories) {
      const existing = await prodPrisma.inventoryCategory.findFirst({
        where: { 
          name: category.name,
          organizationId: orgMap[category.organization?.name || 'Kelechi\'s Farm']
        }
      });
      
      if (!existing) {
        await prodPrisma.inventoryCategory.create({
          data: {
            name: category.name,
            description: category.description,
            icon: category.icon,
            color: category.color,
            parentId: category.parentId,
            isSubcategory: category.isSubcategory,
            organizationId: orgMap[category.organization?.name || 'Kelechi\'s Farm'],
            metadata: category.metadata
          }
        });
        console.log(`✅ Created: ${category.name}`);
      } else {
        console.log(`⏭️ Exists: ${category.name}`);
      }
    }
    
    // 3. Import Income Entries
    console.log('\n💰 Importing Income Entries...');
    for (const income of data.incomeEntries) {
      await prodPrisma.incomeEntry.create({
        data: {
          amount: income.amount,
          category: income.category,
          paymentMethod: income.paymentMethod || 'CASH',
          date: income.date,
          description: income.description,
          organizationId: orgMap[income.organization?.name || 'Kelechi\'s Farm'],
          userId: income.userId || 9, // Default to owner user
          createdBy: income.createdBy
        }
      });
      console.log(`✅ Created: ${income.amount} - ${income.category}`);
    }
    
    // 4. Import Expense Entries
    console.log('\n💸 Importing Expense Entries...');
    for (const expense of data.expenseEntries) {
      await prodPrisma.expenseEntry.create({
        data: {
          amount: expense.amount,
          category: expense.category,
          note: expense.description,
          date: expense.date,
          organizationId: orgMap[expense.organization?.name || 'Kelechi\'s Farm'],
          userId: expense.userId || 9, // Default to owner user
          createdBy: expense.createdBy,
          merchant: expense.merchant || 'Manual Entry'
        }
      });
      console.log(`✅ Created: ${expense.amount} - ${expense.category}`);
    }
    
    // 5. Import Invoices
    console.log('\n🧾 Importing Invoices...');
    for (const invoice of data.invoices) {
      const existing = await prodPrisma.invoice.findFirst({
        where: { invoiceNumber: invoice.invoiceNumber }
      });
      
      if (!existing) {
        await prodPrisma.invoice.create({
          data: {
            invoiceNumber: invoice.invoiceNumber,
            clientName: invoice.clientName,
            clientEmail: invoice.clientEmail,
            clientPhone: invoice.clientPhone,
            clientAddress: invoice.clientAddress,
            businessName: invoice.businessName,
            businessEmail: invoice.businessEmail,
            businessPhone: invoice.businessPhone,
            businessAddress: invoice.businessAddress,
            items: invoice.items,
            subtotal: invoice.subtotal,
            tax: invoice.tax,
            total: invoice.total,
            status: invoice.status,
            paymentMethod: invoice.paymentMethod,
            dueDate: invoice.dueDate,
            notes: invoice.notes,
            userId: invoice.userId || 9, // Default to owner user
            createdBy: invoice.createdBy
          }
        });
        console.log(`✅ Created: ${invoice.invoiceNumber}`);
      } else {
        console.log(`⏭️ Exists: ${invoice.invoiceNumber}`);
      }
    }
    
    console.log('\n🎉 Import completed successfully!');
    console.log('📊 All development data has been imported to production database');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prodPrisma.$disconnect();
  }
}

importDevDataToProduction();
