const fs = require('fs');
const path = require('path');

function scanDirectory(dir, searchTerm) {
  let results = [];
  
  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    
    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .git directories
        if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
          walkDir(filePath);
        }
      } else {
        // Only check specific file types
        const ext = path.extname(file).toLowerCase();
        if (['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.env'].includes(ext)) {
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes(searchTerm)) {
              results.push({
                file: filePath,
                matches: content.split('\n').filter(line => line.includes(searchTerm)).length
              });
            }
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    }
  }
  
  walkDir(dir);
  return results;
}

function checkFarmOpsOccurrences() {
  console.log('🔍 Scanning for remaining "farm-ops" or "FarmOps" occurrences...\n');
  
  const projectRoot = 'c:/Users/ADMIN/Documents/webprojects/track-farm-ops';
  
  // Check for different variations
  const searchTerms = ['farm-ops', 'FarmOps', 'farmops'];
  
  for (const term of searchTerms) {
    console.log(`📋 Checking for "${term}":`);
    
    const results = scanDirectory(projectRoot, term);
    
    if (results.length === 0) {
      console.log(`   ✅ No occurrences of "${term}" found\n`);
    } else {
      console.log(`   ⚠️  Found ${results.length} file(s) with "${term}":`);
      results.forEach(result => {
        console.log(`      - ${result.file} (${result.matches} matches)`);
      });
      console.log('');
    }
  }
  
  // Check that track-farm-ops exists where expected
  console.log('✅ Verification: Checking that "track-farm-ops" and "TrackFarmOps" are present:');
  
  const trackTerms = ['track-farm-ops', 'TrackFarmOps', 'trackfarmops'];
  for (const term of trackTerms) {
    const results = scanDirectory(projectRoot, term);
    console.log(`   📊 Found "${term}" in ${results.length} file(s)`);
  }
  
  console.log('\n🎉 Scan completed!');
}

checkFarmOpsOccurrences();
