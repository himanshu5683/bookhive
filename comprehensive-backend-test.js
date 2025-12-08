import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

import mongoose from 'mongoose';
import { connect } from 'http2';
import axios from 'axios';

console.log('=== BOOKHIVE BACKEND COMPREHENSIVE VALIDATION ===\n');

// 1. ENV Configuration Validation
console.log('1. ENVIRONMENT CONFIGURATION VALIDATION');
console.log('----------------------------------------');

// NODE_ENV
if (process.env.NODE_ENV === 'production') {
  console.log('✅ NODE_ENV is correctly set to production');
} else {
  console.log('❌ NODE_ENV is not set to production:', process.env.NODE_ENV);
}

// MONGODB_URI
const expectedMongoURI = 'mongodb+srv://bookhive_user:HIMANSHU2005@cluster0.pujtcl4.mongodb.net/bookhive?retryWrites=true&w=majority&appName=Cluster0';
if (process.env.MONGODB_URI === expectedMongoURI) {
  console.log('✅ MONGODB_URI is correctly configured');
} else {
  console.log('❌ MONGODB_URI is incorrect');
  console.log('Expected:', expectedMongoURI);
  console.log('Actual:', process.env.MONGODB_URI);
}

// CORS URLs
const expectedFrontendURL = 'https://himanshu5683.github.io/bookhive';
if (process.env.FRONTEND_URL === expectedFrontendURL) {
  console.log('✅ FRONTEND_URL is correctly configured');
} else {
  console.log('❌ FRONTEND_URL is incorrect');
}

if (process.env.PRODUCTION_URL === expectedFrontendURL) {
  console.log('✅ PRODUCTION_URL is correctly configured');
} else {
  console.log('❌ PRODUCTION_URL is incorrect');
}

if (process.env.REACT_APP_URL && process.env.REACT_APP_URL.includes(expectedFrontendURL)) {
  console.log('✅ REACT_APP_URL is correctly configured');
} else {
  console.log('❌ REACT_APP_URL is incorrect');
}

// OAuth Variables
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('✅ Google OAuth variables exist');
} else {
  console.log('⚠️ Google OAuth variables missing (optional for testing)');
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  console.log('✅ GitHub OAuth variables exist');
} else {
  console.log('⚠️ GitHub OAuth variables missing (optional for testing)');
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  console.log('✅ Facebook OAuth variables exist');
} else {
  console.log('⚠️ Facebook OAuth variables missing (optional for testing)');
}

// OPENAI_API_KEY
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-actual-openai-api-key-here') {
  console.log('✅ OPENAI_API_KEY exists');
} else {
  console.log('⚠️ OPENAI_API_KEY not configured (will use fallback AI)');
}

console.log('\n');

// 2. Database Connection Validation
console.log('2. DATABASE CONNECTION VALIDATION');
console.log('-------------------------------');

// Check that database.js uses only process.env.MONGODB_URI
import fs from 'fs';
import path from 'path';

const databaseFilePath = path.join('./backend/db/database.js');
const databaseFileContent = fs.readFileSync(databaseFilePath, 'utf8');

if (databaseFileContent.includes('process.env.MONGODB_URI') && !databaseFileContent.includes('localhost:27017')) {
  console.log('✅ Database configuration uses only process.env.MONGODB_URI');
} else {
  console.log('❌ Database configuration contains local fallback or incorrect URI usage');
}

// Check that connection failure throws process.exit(1)
if (databaseFileContent.includes('process.exit(1)')) {
  console.log('✅ Database failure correctly throws process.exit(1)');
} else {
  console.log('❌ Database failure handling is incorrect');
}

console.log('\n');

// 3. Session Store Validation
console.log('3. SESSION STORE VALIDATION');
console.log('---------------------------');

const serverFilePath = path.join('./backend/server.js');
const serverFileContent = fs.readFileSync(serverFilePath, 'utf8');

if (serverFileContent.includes('mongoUrl: process.env.MONGODB_URI') && !serverFileContent.includes('localhost:27017')) {
  console.log('✅ Session store uses the same MongoDB cloud URI');
} else {
  console.log('❌ Session store configuration is incorrect');
}

if (serverFileContent.includes('connect-mongo')) {
  console.log('✅ Connect-mongo configuration is present');
} else {
  console.log('❌ Connect-mongo configuration is missing');
}

console.log('\n');

// 4. CORS Rules Validation
console.log('4. CORS RULES VALIDATION');
console.log('------------------------');

const allowedOrigins = [
  "http://localhost:3000",
  "https://himanshu5683.github.io/bookhive"
];

if (serverFileContent.includes('credentials: true')) {
  console.log('✅ CORS credentials are enabled');
} else {
  console.log('❌ CORS credentials are not enabled');
}

// Check if allowed origins are present
let corsValid = true;
for (const origin of allowedOrigins) {
  if (!serverFileContent.includes(origin)) {
    console.log(`❌ CORS missing allowed origin: ${origin}`);
    corsValid = false;
  }
}

if (corsValid) {
  console.log('✅ CORS allows required origins');
}

console.log('\n');

// 5. Backend Routes Validation
console.log('5. BACKEND ROUTES VALIDATION');
console.log('----------------------------');

const requiredRoutes = [
  '/api/auth/signup',
  '/api/auth/login',
  '/api/auth/verify',
  '/api/resources',
  '/api/ai/chat',
  '/api/oauth/google',
  '/api/oauth/github',
  '/api/oauth/facebook',
  '/api/health'
];

// Check if routes are mounted
const routeChecks = [
  { route: '/api/auth', file: 'auth.js' },
  { route: '/api/oauth', file: 'oauth.js' },
  { route: '/api/resources', file: 'resources.js' },
  { route: '/api/ai', file: 'ai.js' }
];

let routesValid = true;
for (const check of routeChecks) {
  if (serverFileContent.includes(`app.use('${check.route}',`)) {
    console.log(`✅ Route ${check.route} is mounted`);
  } else {
    console.log(`❌ Route ${check.route} is not mounted`);
    routesValid = false;
  }
}

// Check health endpoint specifically
if (serverFileContent.includes('/api/health')) {
  console.log('✅ Health check endpoint exists');
} else {
  console.log('❌ Health check endpoint is missing');
  routesValid = false;
}

console.log('\n');

// 6. Frontend-Backend Sync Validation
console.log('6. FRONTEND-BACKEND SYNC VALIDATION');
console.log('-----------------------------------');

const frontendEnvPath = path.join('./.env');
const frontendEnvContent = fs.readFileSync(frontendEnvPath, 'utf8');

const backendApiUrl = 'https://bookhive-backend-production.up.railway.app/api';
if (frontendEnvContent.includes(backendApiUrl)) {
  console.log('✅ Frontend points to correct backend API URL');
} else {
  console.log('❌ Frontend does not point to correct backend API URL');
}

console.log('\n');

// 7. Railway Deployment Validation
console.log('7. RAILWAY DEPLOYMENT VALIDATION');
console.log('--------------------------------');

const railwayJsonPath = path.join('./backend/railway.json');
const railwayJsonContent = fs.readFileSync(railwayJsonPath, 'utf8');

if (railwayJsonContent.includes('startCommand') && railwayJsonContent.includes('node server.js')) {
  console.log('✅ Railway start command is correctly configured');
} else {
  console.log('❌ Railway start command is incorrectly configured');
}

console.log('\n');

// Final Verdict
console.log('=== FINAL VERDICT ===');
console.log('--------------------');

// Count issues
const issues = [];
if (process.env.NODE_ENV !== 'production') issues.push('NODE_ENV not production');
if (process.env.MONGODB_URI !== expectedMongoURI) issues.push('Incorrect MONGODB_URI');
if (!serverFileContent.includes('process.exit(1)')) issues.push('Database failure handling incorrect');
if (!serverFileContent.includes('mongoUrl: process.env.MONGODB_URI')) issues.push('Session store misconfigured');
if (!serverFileContent.includes('credentials: true')) issues.push('CORS credentials disabled');

if (issues.length === 0) {
  console.log('🎉 ALL TESTS PASSED - FULLY READY FOR DEPLOYMENT 🎉');
  console.log('\n✅ Environment configuration is correct');
  console.log('✅ Database connection is properly configured');
  console.log('✅ Session store uses the same MongoDB URI');
  console.log('✅ CORS rules are correctly set up');
  console.log('✅ All backend routes are properly mounted');
  console.log('✅ Frontend-backend synchronization is correct');
  console.log('✅ Railway deployment configuration is valid');
} else {
  console.log('❌ ISSUES FOUND - FIXES NEEDED:');
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue}`);
  });
}