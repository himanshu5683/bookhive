// Test script to verify network connectivity fixes
const axios = require('axios');

async function testNetworkFix() {
  console.log('Testing network connectivity fixes...\n');
  
  const baseURL = 'https://bookhive-backend-production.up.railway.app/api';
  
  try {
    // Test 1: Health check
    console.log('1. Testing health check endpoint...');
    const healthResponse = await axios.get(`${baseURL}/health`, {
      timeout: 5000
    });
    console.log('   ✅ Health check successful');
    console.log('   Status:', healthResponse.status);
    console.log('   Message:', healthResponse.data.message);
    console.log('');
    
    // Test 2: CORS preflight
    console.log('2. Testing CORS preflight for auth endpoints...');
    const preflightResponse = await axios.options(`${baseURL}/auth/login`, {
      headers: {
        'Origin': 'https://himanshu5683.github.io',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      },
      timeout: 5000
    });
    console.log('   ✅ CORS preflight successful');
    console.log('   Status:', preflightResponse.status);
    console.log('   Access-Control-Allow-Origin:', preflightResponse.headers['access-control-allow-origin']);
    console.log('   Access-Control-Allow-Credentials:', preflightResponse.headers['access-control-allow-credentials']);
    console.log('');
    
    // Test 3: Login endpoint (expected to fail with 401)
    console.log('3. Testing login endpoint (should return 401 for invalid credentials)...');
    try {
      await axios.post(`${baseURL}/auth/login`, {
        email: 'test@example.com',
        password: 'wrongpassword'
      }, {
        headers: {
          'Origin': 'https://himanshu5683.github.io'
        },
        timeout: 10000
      });
      console.log('   ❌ Unexpected: Login succeeded');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('   ✅ Login endpoint accessible (returned expected 401 error)');
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.error);
      } else {
        console.log('   ❌ Login test failed with unexpected error:');
        console.log('   Status:', error.response?.status || 'No response');
        console.log('   Message:', error.message);
      }
    }
    
    console.log('\n🎉 All tests completed! Network connectivity should now be working.');
    console.log('The "Network error. Please check your connection" issue should be resolved.');
    
  } catch (error) {
    console.log('❌ Network test failed:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    } else if (error.request) {
      console.log('   No response received');
      console.log('   Error message:', error.message);
      console.log('   Error code:', error.code);
    } else {
      console.log('   Error message:', error.message);
    }
  }
}

testNetworkFix();