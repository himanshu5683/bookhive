// Debug script to check backend deployment status
const axios = require('axios');

async function debugBackend() {
  console.log('=== Debugging BookHive Backend Deployment ===\n');
  
  // Common backend URLs that might be used
  const urls = [
    'https://bookhive-backend-production.up.railway.app',
    'https://bookhive-backend-production.up.railway.app/api/health',
    'https://bookhive.up.railway.app',
    'https://bookhive.up.railway.app/api/health'
  ];
  
  for (const [index, url] of urls.entries()) {
    try {
      console.log(`Testing URL ${index + 1}/${urls.length}: ${url}`);
      const response = await axios.get(url, { 
        timeout: 15000,
        validateStatus: () => true // Don't reject on non-2xx status codes
      });
      console.log(`  ✅ Status: ${response.status}`);
      if (response.data) {
        console.log(`  📄 Response:`, typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data);
      }
      console.log('');
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`  📊 Response Status: ${error.response.status}`);
        if (error.response.data) {
          console.log(`  📄 Response Data:`, typeof error.response.data === 'object' ? JSON.stringify(error.response.data, null, 2) : error.response.data);
        }
      }
      console.log('');
    }
  }
  
  // Test CORS preflight specifically
  console.log('=== Testing CORS Preflight ===');
  try {
    const corsResponse = await axios.options('https://bookhive-backend-production.up.railway.app/api/auth/login', {
      headers: {
        'Origin': 'https://himanshu5683.github.io',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      },
      timeout: 15000,
      validateStatus: () => true
    });
    console.log(`✅ CORS Preflight Status: ${corsResponse.status}`);
    console.log(`Access-Control-Allow-Origin: ${corsResponse.headers['access-control-allow-origin']}`);
    console.log(`Access-Control-Allow-Credentials: ${corsResponse.headers['access-control-allow-credentials']}`);
    console.log(`Access-Control-Allow-Methods: ${corsResponse.headers['access-control-allow-methods']}`);
  } catch (error) {
    console.log(`❌ CORS Preflight Error: ${error.message}`);
    if (error.response) {
      console.log(`📊 Response Status: ${error.response.status}`);
      console.log(`📄 Response Headers:`, error.response.headers);
    }
  }
  
  console.log('\n=== Debugging Complete ===');
  console.log('If all URLs return 404, the backend service may not be deployed correctly.');
  console.log('Check your Railway dashboard to ensure the backend service is running.');
}

debugBackend();