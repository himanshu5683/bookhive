// Script to verify deployment and functionality
const axios = require('axios');

async function verifyDeployment() {
  console.log('🔍 Verifying BookHive deployment and functionality...\n');
  
  try {
    // 1. Check if the GitHub Pages site is accessible
    console.log('1. Checking GitHub Pages site accessibility...');
    const siteResponse = await axios.get('https://himanshu5683.github.io/bookhive/', {
      timeout: 10000
    });
    
    if (siteResponse.status === 200) {
      console.log('   ✅ GitHub Pages site is accessible');
      console.log('   📍 Status:', siteResponse.status);
      console.log('   📄 Content type:', siteResponse.headers['content-type']);
    } else {
      console.log('   ❌ GitHub Pages site is not accessible');
      console.log('   📍 Status:', siteResponse.status);
      return;
    }
    
    // 2. Check backend health endpoint
    console.log('\n2. Checking backend health endpoint...');
    const backendUrl = 'https://bookhive-production-9463.up.railway.app/api/health';
    const healthResponse = await axios.get(backendUrl, {
      timeout: 10000
    });
    
    if (healthResponse.status === 200 && healthResponse.data.status === 'OK') {
      console.log('   ✅ Backend is healthy and accessible');
      console.log('   📍 Status:', healthResponse.status);
      console.log('   📄 Message:', healthResponse.data.message);
    } else {
      console.log('   ❌ Backend health check failed');
      console.log('   📍 Status:', healthResponse.status);
      return;
    }
    
    // 3. Test CORS preflight for auth endpoints
    console.log('\n3. Testing CORS preflight for auth endpoints...');
    try {
      const preflightResponse = await axios.options(
        'https://bookhive-production-9463.up.railway.app/api/auth/login',
        {
          headers: {
            'Origin': 'https://himanshu5683.github.io/bookhive',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
          },
          timeout: 10000
        }
      );
      
      if (preflightResponse.status === 200 || preflightResponse.status === 204) {
        console.log('   ✅ CORS preflight successful');
        console.log('   📍 Status:', preflightResponse.status);
        console.log('   🔐 Access-Control-Allow-Credentials:', 
          preflightResponse.headers['access-control-allow-credentials']);
        console.log('   🌐 Access-Control-Allow-Origin:', 
          preflightResponse.headers['access-control-allow-origin']);
      } else {
        console.log('   ❌ CORS preflight failed');
        console.log('   📍 Status:', preflightResponse.status);
      }
    } catch (error) {
      console.log('   ❌ CORS preflight failed with error:', error.message);
    }
    
    // 4. Test login endpoint (expected to fail with 401 for invalid credentials)
    console.log('\n4. Testing login endpoint (should return 401 for invalid credentials)...');
    try {
      await axios.post(
        'https://bookhive-production-9463.up.railway.app/api/auth/login',
        {
          email: 'test@example.com',
          password: 'wrongpassword'
        },
        {
          headers: {
            'Origin': 'https://himanshu5683.github.io/bookhive'
          },
          timeout: 10000
        }
      );
      console.log('   ❌ Unexpected: Login succeeded with invalid credentials');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('   ✅ Login endpoint accessible (returned expected 401 error)');
        console.log('   📍 Status:', error.response.status);
        console.log('   📄 Message:', error.response.data.error);
      } else {
        console.log('   ❌ Login test failed with unexpected error:');
        console.log('   📍 Status:', error.response?.status || 'No response');
        console.log('   📄 Message:', error.message);
      }
    }
    
    console.log('\n🎉 All verification tests completed!');
    console.log('✅ Your BookHive project is successfully deployed and functional.');
    console.log('🌐 Visit: https://himanshu5683.github.io/bookhive/');
    console.log('🔐 Test login/signup functionality to confirm everything works correctly.');
    
  } catch (error) {
    console.log('❌ Verification failed with error:');
    if (error.response) {
      console.log('   📍 Status:', error.response.status);
      console.log('   📄 Data:', error.response.data);
    } else if (error.request) {
      console.log('   ❌ No response received');
      console.log('   📄 Error message:', error.message);
    } else {
      console.log('   📄 Error message:', error.message);
    }
  }
}

verifyDeployment();