const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function investigateMissingRecords() {
  try {
    console.log('🔍 Investigating missing records for keechi@owner.com...');
    
    const userId = 4;
    const organizationId = 6;
    
    // First, let's see what tables actually exist in the database
    console.log('\n📋 Checking database schema...');
    
    const modelNames = [
      'user', 'organization', 'subscription', 'invoice', 
      'income', 'expense', 'inventory', 'asset'
    ];
    
    const availableModels = {};
    
    for (const modelName of modelNames) {
      try {
        // Try to access the model
        const model = prisma[modelName];
        if (model && typeof model.findMany === 'function') {
          availableModels[modelName] = true;
          console.log(`✅ ${modelName} model available`);
        } else {
          availableModels[modelName] = false;
          console.log(`❌ ${modelName} model not available`);
        }
      } catch (error) {
        availableModels[modelName] = false;
        console.log(`❌ ${modelName} model error:`, error.message);
      }
    }
    
    console.log('\n📊 Checking data in available models...');
    
    // Check each available model for data
    for (const [modelName, isAvailable] of Object.entries(availableModels)) {
      if (!isAvailable) continue;
      
      try {
        let whereClause = {};
        let selectClause = { id: true };
        
        // Set appropriate where clauses
        if (modelName === 'user' || modelName === 'subscription') {
          whereClause = { userId };
        } else if (modelName === 'organization') {
          whereClause = { id: organizationId };
        } else if (['invoice', 'income', 'expense'].includes(modelName)) {
          whereClause = { userId };
          selectClause = { id: true, amount: true, date: true, description: true };
        } else if (['inventory', 'asset'].includes(modelName)) {
          whereClause = { organizationId };
          selectClause = { id: true, name: true, status: true };
        }
        
        const records = await prisma[modelName].findMany({
          where: whereClause,
          select: selectClause,
          take: 10 // Limit to 10 for brevity
        });
        
        console.log(`\n📄 ${modelName.toUpperCase()} Records: ${records.length}`);
        if (records.length > 0) {
          records.forEach((record, i) => {
            console.log(`   ${i+1}. ${JSON.stringify(record)}`);
          });
        } else {
          console.log(`   No records found`);
        }
        
      } catch (error) {
        console.log(`❌ Error checking ${modelName}:`, error.message);
      }
    }
    
    // Let's also check if there are any records without the user/organization filters
    console.log('\n🔍 Checking for ANY records in problematic models...');
    
    const problematicModels = ['invoice', 'income', 'expense', 'inventory', 'asset'];
    
    for (const modelName of problematicModels) {
      if (!availableModels[modelName]) continue;
      
      try {
        const allRecords = await prisma[modelName].findMany({
          select: { id: true, userId: true, organizationId: true },
          take: 5
        });
        
        console.log(`\n📄 ${modelName.toUpperCase()} - All records (sample): ${allRecords.length} total`);
        if (allRecords.length > 0) {
          allRecords.forEach((record, i) => {
            console.log(`   ${i+1}. ID: ${record.id}, User: ${record.userId}, Org: ${record.organizationId}`);
          });
        }
      } catch (error) {
        console.log(`❌ Error checking all ${modelName}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Investigation error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

investigateMissingRecords();
