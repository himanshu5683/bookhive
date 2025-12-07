// Script to identify and list duplicate or unused files for cleanup
const fs = require('fs');
const path = require('path');

// Function to get all files in a directory recursively
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  
  arrayOfFiles = arrayOfFiles || [];
  
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });
  
  return arrayOfFiles;
}

// Function to check if a file is imported anywhere
function isFileImported(filePath, allFiles) {
  const fileName = path.basename(filePath, path.extname(filePath));
  
  for (const file of allFiles) {
    if (file !== filePath && (file.endsWith('.js') || file.endsWith('.jsx'))) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes(fileName) || content.includes(filePath)) {
          return true;
        }
      } catch (err) {
        console.log(`Could not read file: ${file}`);
      }
    }
  }
  
  return false;
}

// Main function
function findUnusedFiles() {
  console.log('Scanning for unused files...\n');
  
  // Get all files
  const allFiles = getAllFiles('./src');
  
  // Filter for potential duplicate or unused files
  const jsxFiles = allFiles.filter(file => file.endsWith('.jsx'));
  const jsFiles = allFiles.filter(file => file.endsWith('.js') && !file.includes('node_modules'));
  
  console.log('Potential duplicate or unused files:');
  console.log('=====================================');
  
  // Check auth files specifically
  const authFiles = allFiles.filter(file => 
    file.includes('/auth/') && (file.endsWith('.jsx') || file.endsWith('.js'))
  );
  
  for (const file of authFiles) {
    if (!isFileImported(file, allFiles)) {
      console.log(`⚠️  Potentially unused auth file: ${file}`);
    }
  }
  
  // Check for duplicate files
  const fileNames = {};
  allFiles.forEach(file => {
    const baseName = path.basename(file);
    if (!fileNames[baseName]) {
      fileNames[baseName] = [];
    }
    fileNames[baseName].push(file);
  });
  
  for (const [fileName, paths] of Object.entries(fileNames)) {
    if (paths.length > 1) {
      console.log(`🔄 Duplicate file name found: ${fileName}`);
      paths.forEach(p => console.log(`   - ${p}`));
    }
  }
  
  console.log('\n✅ Scan complete. Review the list above for files that can be safely removed.');
  console.log('⚠️  Always verify that files are not imported before deleting them.');
}

findUnusedFiles();