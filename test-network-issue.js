// Test script to diagnose and fix network issues
const axios = require('axios');

async function testNetworkConnection() {
  console.log('Testing network connection to backend...');
  
  const apiUrl = 'https://bookhive-backend-production.up.railway.app/api';
  
  try {
    // Test basic connectivity
    console.log('Testing basic connectivity...');
    const healthResponse = await axios.get(`${apiUrl}/health`, {
      timeout: 5000
    });
    console.log('Health check successful:', healthResponse.data);
  } catch (error) {
    console.error('Health check failed:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return;
  }
  
  try {
    // Test CORS preflight
    console.log('Testing CORS preflight...');
    const optionsResponse = await axios.options(`${apiUrl}/auth/login`, {
      headers: {
        'Origin': 'https://himanshu5683.github.io',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      },
      timeout: 5000
    });
    console.log('CORS preflight successful');
    console.log('Access-Control-Allow-Origin:', optionsResponse.headers['access-control-allow-origin']);
    console.log('Access-Control-Allow-Credentials:', optionsResponse.headers['access-control-allow-credentials']);
  } catch (error) {
    console.error('CORS preflight failed:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else {
      console.error('Error:', error.message);
    }
  }
  
  try {
    // Test login endpoint
    console.log('Testing login endpoint...');
    const loginResponse = await axios.post(`${apiUrl}/auth/login`, {
      email: 'test@example.com',
      password: 'testpassword'
    }, {
      headers: {
        'Origin': 'https://himanshu5683.github.io'
      },
      timeout: 10000
    });
    console.log('Login test successful:', loginResponse.data);
  } catch (error) {
    console.error('Login test failed:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.message);
      console.error('Request details:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testNetworkConnection();