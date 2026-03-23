const { PrismaClient } = require('@prisma/client');

// Development database (local)
const devPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres@localhost:5432/track-farm-ops"
    }
  }
});

// Production database (Render)
const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://farmops_prod_user:oXkNxZdBXLXM7wxVOs9VhWj1o77Ap8gr@dpg-d6ute1hj16oc738tee1g-a.oregon-postgres.render.com:5432/farmops_prod"
    }
  }
});

async function syncDevToProduction() {
  try {
    console.log('🔄 Starting sync from development to production database...\n');
    
    // 1. Sync Organizations
    console.log('🏢 Syncing Organizations...');
    const devOrgs = await devPrisma.organization.findMany();
    console.log(`Found ${devOrgs.length} organizations in development`);
    
    for (const org of devOrgs) {
      const existingOrg = await prodPrisma.organization.findFirst({
        where: { name: org.name }
      });
      
      if (!existingOrg) {
        await prodPrisma.organization.create({
          data: {
            name: org.name,
            description: org.description
          }
        });
        console.log(`✅ Created organization: ${org.name}`);
      } else {
        console.log(`⏭️ Organization already exists: ${org.name}`);
      }
    }
    
    // 2. Sync Inventory Categories
    console.log('\n📂 Syncing Inventory Categories...');
    const devCategories = await devPrisma.inventoryCategory.findMany();
    console.log(`Found ${devCategories.length} categories in development`);
    
    for (const category of devCategories) {
      const existingCategory = await prodPrisma.inventoryCategory.findFirst({
        where: { 
          name: category.name,
          organizationId: category.organizationId 
        }
      });
      
      if (!existingCategory) {
        await prodPrisma.inventoryCategory.create({
          data: {
            name: category.name,
            description: category.description,
            icon: category.icon,
            color: category.color,
            parentId: category.parentId,
            isSubcategory: category.isSubcategory,
            organizationId: category.organizationId,
            metadata: category.metadata
          }
        });
        console.log(`✅ Created category: ${category.name}`);
      } else {
        console.log(`⏭️ Category already exists: ${category.name}`);
      }
    }
    
    // 3. Sync Inventory Items
    console.log('\n📦 Syncing Inventory Items...');
    const devItems = await devPrisma.inventoryItem.findMany();
    console.log(`Found ${devItems.length} inventory items in development`);
    
    for (const item of devItems) {
      const existingItem = await prodPrisma.inventoryItem.findFirst({
        where: { 
          name: item.name,
          organizationId: item.organizationId 
        }
      });
      
      if (!existingItem) {
        await prodPrisma.inventoryItem.create({
          data: {
            name: item.name,
            type: item.type,
            unit: item.unit,
            quantity: item.quantity,
            initialQuantity: item.initialQuantity,
            description: item.description,
            categoryId: item.categoryId,
            organizationId: item.organizationId,
            location: item.location,
            supplier: item.supplier,
            purchaseDate: item.purchaseDate,
            expiryDate: item.expiryDate,
            minimumStock: item.minimumStock,
            pricePerUnit: item.pricePerUnit,
            metadata: item.metadata
          }
        });
        console.log(`✅ Created inventory item: ${item.name}`);
      } else {
        console.log(`⏭️ Inventory item already exists: ${item.name}`);
      }
    }
    
    // 4. Sync Income Entries
    console.log('\n💰 Syncing Income Entries...');
    const devIncome = await devPrisma.incomeEntry.findMany();
    console.log(`Found ${devIncome.length} income entries in development`);
    
    for (const income of devIncome) {
      await prodPrisma.incomeEntry.create({
        data: {
          amount: income.amount,
          category: income.category,
          description: income.description,
          date: income.date,
          organizationId: income.organizationId,
          createdBy: income.createdBy
        }
      });
      console.log(`✅ Created income entry: ${income.amount} - ${income.category}`);
    }
    
    // 5. Sync Expense Entries
    console.log('\n💸 Syncing Expense Entries...');
    const devExpenses = await devPrisma.expenseEntry.findMany();
    console.log(`Found ${devExpenses.length} expense entries in development`);
    
    for (const expense of devExpenses) {
      await prodPrisma.expenseEntry.create({
        data: {
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          date: expense.date,
          organizationId: expense.organizationId,
          createdBy: expense.createdBy
        }
      });
      console.log(`✅ Created expense entry: ${expense.amount} - ${expense.category}`);
    }
    
    // 6. Sync Assets
    console.log('\n🚜 Syncing Assets...');
    const devAssets = await devPrisma.asset.findMany();
    console.log(`Found ${devAssets.length} assets in development`);
    
    for (const asset of devAssets) {
      const existingAsset = await prodPrisma.asset.findFirst({
        where: { 
          name: asset.name,
          organizationId: asset.organizationId 
        }
      });
      
      if (!existingAsset) {
        await prodPrisma.asset.create({
          data: {
            name: asset.name,
            category: asset.category,
            description: asset.description,
            purchaseDate: asset.purchaseDate,
            purchaseCost: asset.purchaseCost,
            currentValue: asset.currentValue,
            status: asset.status,
            location: asset.location,
            organizationId: asset.organizationId,
            createdBy: asset.createdBy,
            metadata: asset.metadata
          }
        });
        console.log(`✅ Created asset: ${asset.name}`);
      } else {
        console.log(`⏭️ Asset already exists: ${asset.name}`);
      }
    }
    
    // 7. Sync Invoices
    console.log('\n🧾 Syncing Invoices...');
    const devInvoices = await devPrisma.invoice.findMany();
    console.log(`Found ${devInvoices.length} invoices in development`);
    
    for (const invoice of devInvoices) {
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
          userId: invoice.userId,
          createdBy: invoice.createdBy
        }
      });
      console.log(`✅ Created invoice: ${invoice.invoiceNumber}`);
    }
    
    console.log('\n🎉 Sync completed successfully!');
    console.log('📊 All development data has been copied to production database');
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

syncDevToProduction();
