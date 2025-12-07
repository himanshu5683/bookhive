// Test script to verify login functionality
const axios = require('axios');

// Configuration
const API_BASE_URL = 'https://bookhive-backend-production.up.railway.app/api';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword123';

async function testLogin() {
  console.log('Testing login functionality...');
  
  try {
    // Test login
    console.log('Attempting login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    }, {
      withCredentials: true
    });
    
    console.log('Login successful!');
    console.log('Response:', loginResponse.data);
    
    // Test with credentials
    if (loginResponse.data.token) {
      console.log('Testing authenticated request...');
      const authResponse = await axios.get(`${API_BASE_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        },
        withCredentials: true
      });
      
      console.log('Authenticated request successful!');
      console.log('Response:', authResponse.data);
    }
  } catch (error) {
    console.error('Login test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testLogin();