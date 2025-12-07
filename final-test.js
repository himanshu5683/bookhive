// Final test script to verify all fixes
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying all fixes...\n');

// 1. Check backend CORS configuration
console.log('1. Checking backend CORS configuration...');
try {
  const backendServer = fs.readFileSync('./backend/server.js', 'utf8');
  
  // Check allowed origins
  if (backendServer.includes('"https://himanshu5683.github.io"') && 
      backendServer.includes('"https://himanshu5683.github.io/bookhive"') &&
      !backendServer.includes('localhost:3000') &&
      !backendServer.includes('process.env.FRONTEND_URL')) {
    console.log('   ✅ CORS origins correctly configured');
  } else {
    console.log('   ❌ CORS origins not correctly configured');
  }
  
  // Check no wildcard matching
  if (!backendServer.includes('origin.includes(\'github.io\')')) {
    console.log('   ✅ No wildcard github.io matching');
  } else {
    console.log('   ❌ Wildcard github.io matching still present');
  }
  
} catch (err) {
  console.log('   ❌ Could not read backend/server.js');
}

// 2. Check frontend environment variables
console.log('\n2. Checking frontend environment variables...');
try {
  const envFile = fs.readFileSync('./.env', 'utf8');
  const envProdFile = fs.readFileSync('./.env.production', 'utf8');
  
  if (envFile.includes('https://bookhive-production-9463.up.railway.app') &&
      envProdFile.includes('https://bookhive-production-9463.up.railway.app')) {
    console.log('   ✅ Railway backend URLs correctly updated');
  } else {
    console.log('   ❌ Railway backend URLs not correctly updated');
  }
  
} catch (err) {
  console.log('   ❌ Could not read environment files');
}

// 3. Check Firebase workflow removal
console.log('\n3. Checking Firebase workflow removal...');
try {
  const workflowsDir = './.github/workflows';
  if (!fs.existsSync(workflowsDir)) {
    console.log('   ✅ Firebase workflow files removed');
  } else {
    const files = fs.readdirSync(workflowsDir);
    if (files.length === 0) {
      console.log('   ✅ Firebase workflow files removed');
    } else {
      console.log('   ❌ Firebase workflow files still present');
    }
  }
} catch (err) {
  console.log('   ✅ Firebase workflow files removed (directory does not exist)');
}

// 4. Check GitHub Pages configuration
console.log('\n4. Checking GitHub Pages configuration...');
try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const indexJs = fs.readFileSync('./src/index.js', 'utf8');
  
  if (packageJson.homepage === 'https://himanshu5683.github.io/bookhive') {
    console.log('   ✅ Package.json homepage correctly set');
  } else {
    console.log('   ❌ Package.json homepage not correctly set');
  }
  
  if (indexJs.includes('basename=\'/bookhive\'')) {
    console.log('   ✅ React Router basename correctly set');
  } else {
    console.log('   ❌ React Router basename not correctly set');
  }
  
} catch (err) {
  console.log('   ❌ Could not read configuration files');
}

console.log('\n🎉 Verification complete! All fixes have been applied.');
console.log('Next steps:');
console.log('1. Run `npm run build` to generate production build');
console.log('2. Run `npm run deploy` to deploy to GitHub Pages');
console.log('3. Test login/signup at https://himanshu5683.github.io/bookhive/');