// Test script to check backend connectivity
const axios = require('axios');

async function testBackend() {
  console.log('Testing backend connectivity...');
  
  // Test the correct backend URL
  const backendUrls = [
    'https://bookhive-backend-production.up.railway.app',
    'https://bookhive-backend-production.up.railway.app/api/health'
  ];
  
  for (const url of backendUrls) {
    try {
      console.log(`\nTesting URL: ${url}`);
      const response = await axios.get(url, { timeout: 10000 });
      console.log(`✅ Success: ${response.status}`);
      console.log(`Response:`, response.data);
    } catch (error) {
      console.log(`❌ Failed:`, error.message);
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log(`Data:`, error.response.data);
      }
    }
  }
  
  // Test CORS preflight
  console.log('\n--- Testing CORS Preflight ---');
  try {
    const corsResponse = await axios.options('https://bookhive-backend-production.up.railway.app/api/auth/login', {
      headers: {
        'Origin': 'https://himanshu5683.github.io',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      },
      timeout: 10000
    });
    console.log(`✅ CORS Preflight Success: ${corsResponse.status}`);
    console.log(`Access-Control-Allow-Origin:`, corsResponse.headers['access-control-allow-origin']);
    console.log(`Access-Control-Allow-Credentials:`, corsResponse.headers['access-control-allow-credentials']);
  } catch (error) {
    console.log(`❌ CORS Preflight Failed:`, error.message);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Headers:`, error.response.headers);
    }
  }
}

testBackend();