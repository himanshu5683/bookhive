// Simple configuration validator
import fs from 'fs';
import path from 'path';

console.log('=== BOOKHIVE BACKEND CONFIGURATION VALIDATOR ===\n');

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

console.log('1. ENVIRONMENT VARIABLES CHECK');
console.log('---------------------------');

// Check NODE_ENV
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
if (process.env.NODE_ENV === 'production') {
  console.log('✅ NODE_ENV is correctly set to production\n');
} else {
  console.log('❌ NODE_ENV should be set to production\n');
}

// Check MONGODB_URI
const expectedMongoURI = 'mongodb+srv://bookhive_user:HIMANSHU2005@cluster0.pujtcl4.mongodb.net/bookhive?retryWrites=true&w=majority&appName=Cluster0';
console.log(`MONGODB_URI: ${process.env.MONGODB_URI ? 'SET' : 'NOT SET'}`);
if (process.env.MONGODB_URI === expectedMongoURI) {
  console.log('✅ MONGODB_URI is correctly configured\n');
} else {
  console.log('❌ MONGODB_URI is incorrect or missing\n');
  console.log(`Expected: ${expectedMongoURI}`);
  console.log(`Actual: ${process.env.MONGODB_URI}\n`);
}

// Check FRONTEND URLs
const expectedURL = 'https://himanshu5683.github.io/bookhive';
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);
console.log(`PRODUCTION_URL: ${process.env.PRODUCTION_URL}`);

if (process.env.FRONTEND_URL === expectedURL && process.env.PRODUCTION_URL === expectedURL) {
  console.log('✅ Frontend URLs are correctly configured\n');
} else {
  console.log('❌ Frontend URLs are incorrect\n');
}

// Check OAuth variables
console.log('2. OAUTH VARIABLES CHECK');
console.log('----------------------');
console.log(`GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET'}`);
console.log(`GITHUB_CLIENT_ID: ${process.env.GITHUB_CLIENT_ID ? 'SET' : 'NOT SET'}`);
console.log(`FACEBOOK_APP_ID: ${process.env.FACEBOOK_APP_ID ? 'SET' : 'NOT SET'}`);

if (process.env.GOOGLE_CLIENT_ID && process.env.GITHUB_CLIENT_ID && process.env.FACEBOOK_APP_ID) {
  console.log('✅ OAuth variables are present\n');
} else {
  console.log('⚠️ Some OAuth variables are missing (optional for basic functionality)\n');
}

// Check file configurations
console.log('3. FILE CONFIGURATION CHECK');
console.log('-------------------------');

// Check database.js
try {
  const dbFile = fs.readFileSync('./backend/db/database.js', 'utf8');
  if (dbFile.includes('process.env.MONGODB_URI') && !dbFile.includes('localhost:27017')) {
    console.log('✅ Database.js correctly uses only MONGODB_URI\n');
  } else {
    console.log('❌ Database.js contains local MongoDB fallback\n');
  }
  
  if (dbFile.includes('process.exit(1)')) {
    console.log('✅ Database failure handling is correct\n');
  } else {
    console.log('❌ Database failure handling is incorrect\n');
  }
} catch (err) {
  console.log('❌ Could not read database.js file\n');
}

// Check session store in server.js
try {
  const serverFile = fs.readFileSync('./backend/server.js', 'utf8');
  if (serverFile.includes('mongoUrl: process.env.MONGODB_URI') && !serverFile.includes('localhost:27017')) {
    console.log('✅ Session store correctly uses MONGODB_URI\n');
  } else {
    console.log('❌ Session store configuration is incorrect\n');
  }
  
  // Check CORS configuration
  if (serverFile.includes('credentials: true')) {
    console.log('✅ CORS credentials are enabled\n');
  } else {
    console.log('❌ CORS credentials are not enabled\n');
  }
  
  // Check required origins
  const requiredOrigins = [
    'http://localhost:3000',
    'https://himanshu5683.github.io/bookhive'
  ];
  
  let corsValid = true;
  for (const origin of requiredOrigins) {
    if (!serverFile.includes(origin)) {
      console.log(`❌ Missing CORS origin: ${origin}\n`);
      corsValid = false;
    }
  }
  
  if (corsValid) {
    console.log('✅ CORS allows required origins\n');
  }
  
  // Check route mounting
  const routes = ['/api/auth', '/api/oauth', '/api/resources', '/api/ai', '/api/health'];
  for (const route of routes) {
    if (serverFile.includes(`app.use('${route}'`)) {
      console.log(`✅ Route ${route} is mounted\n`);
    } else {
      console.log(`❌ Route ${route} is not mounted\n`);
    }
  }
} catch (err) {
  console.log('❌ Could not read server.js file\n');
}

// Check frontend configuration
console.log('4. FRONTEND CONFIGURATION CHECK');
console.log('------------------------------');

try {
  const frontendEnv = fs.readFileSync('./.env', 'utf8');
  const backendUrl = 'https://bookhive-backend-production.up.railway.app/api';
  
  if (frontendEnv.includes(backendUrl)) {
    console.log('✅ Frontend points to correct backend URL\n');
  } else {
    console.log('❌ Frontend does not point to correct backend URL\n');
  }
} catch (err) {
  console.log('❌ Could not read frontend .env file\n');
}

console.log('=== VALIDATION COMPLETE ===');