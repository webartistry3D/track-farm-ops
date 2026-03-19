const fs = require('fs');
const path = require('path');

function checkStorageForFarmOps() {
  console.log('🔍 Checking storage for "farm-ops" occurrences...\n');

  // 1. Check localStorage (this would run in browser, so we'll check the code that uses it)
  console.log('📋 Checking localStorage usage in code...');
  
  const projectRoot = 'c:/Users/ADMIN/Documents/webprojects/track-farm-ops';
  
  function scanDirectory(dir, searchTerm) {
    let results = [];
    
    function walkDir(currentPath) {
      try {
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
            if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
              try {
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.includes(searchTerm)) {
                  const lines = content.split('\n');
                  lines.forEach((line, index) => {
                    if (line.includes(searchTerm)) {
                      results.push({
                        file: filePath,
                        line: index + 1,
                        content: line.trim()
                      });
                    }
                  });
                }
              } catch (error) {
                // Skip files that can't be read
              }
            }
          }
        }
      } catch (error) {
        // Skip directories that can't be read
      }
    }
    
    walkDir(dir);
    return results;
  }

  // Check for localStorage usage with farm-ops
  const localStorageResults = scanDirectory(projectRoot, 'localStorage');
  const farmOpsLocalStorage = localStorageResults.filter(result => 
    result.content.includes('farm-ops') && 
    (result.content.includes('getItem') || result.content.includes('setItem') || result.content.includes('removeItem'))
  );

  console.log(`   Found ${farmOpsLocalStorage.length} localStorage operations with "farm-ops":`);
  farmOpsLocalStorage.forEach(result => {
    console.log(`   - ${result.file}:${result.line}`);
    console.log(`     ${result.content}`);
  });

  // 2. Check file uploads directory
  console.log('\n📁 Checking file uploads directory...');
  const uploadsDir = path.join(projectRoot, 'backend/uploads');
  
  if (fs.existsSync(uploadsDir)) {
    try {
      const files = fs.readdirSync(uploadsDir);
      console.log(`   Found ${files.length} files in uploads directory`);
      
      const filesWithFarmOps = files.filter(file => 
        file.toLowerCase().includes('farm-ops')
      );
      
      console.log(`   Found ${filesWithFarmOps.length} files with "farm-ops" in filename:`);
      filesWithFarmOps.forEach(file => {
        console.log(`   - ${file}`);
      });
      
      // Check file contents for text files
      const textFiles = files.filter(file => 
        ['.txt', '.json', '.csv', '.md'].includes(path.extname(file).toLowerCase())
      );
      
      console.log(`\n   Checking ${textFiles.length} text files for "farm-ops" content...`);
      let textFilesWithFarmOps = 0;
      
      textFiles.forEach(file => {
        try {
          const filePath = path.join(uploadsDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.toLowerCase().includes('farm-ops')) {
            textFilesWithFarmOps++;
            console.log(`   - ${file} contains "farm-ops"`);
          }
        } catch (error) {
          // Skip files that can't be read as text
        }
      });
      
      console.log(`   Found ${textFilesWithFarmOps} text files containing "farm-ops"`);
      
    } catch (error) {
      console.log(`   ⚠️  Could not read uploads directory: ${error.message}`);
    }
  } else {
    console.log('   📁 Uploads directory does not exist');
  }

  // 3. Check for any configuration files that might contain farm-ops
  console.log('\n⚙️  Checking configuration files...');
  const configFiles = [
    '.env',
    '.env.development', 
    '.env.production',
    'package.json',
    'tsconfig.json',
    'vite.config.ts'
  ];

  configFiles.forEach(configFile => {
    const configPath = path.join(projectRoot, configFile);
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf8');
        if (content.includes('farm-ops')) {
          console.log(`   ⚠️  ${configFile} contains "farm-ops":`);
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (line.includes('farm-ops')) {
              console.log(`     Line ${index + 1}: ${line.trim()}`);
            }
          });
        }
      } catch (error) {
        console.log(`   ⚠️  Could not read ${configFile}: ${error.message}`);
      }
    }
  });

  console.log('\n✅ Storage scan completed!');
  
  const totalIssues = farmOpsLocalStorage.length;
  if (totalIssues === 0) {
    console.log('🎉 No "farm-ops" references found in storage-related code!');
  } else {
    console.log(`⚠️  Found ${totalIssues} storage-related references that may need attention.`);
  }
}

checkStorageForFarmOps();
