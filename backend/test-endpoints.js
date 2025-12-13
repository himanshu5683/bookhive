// test-endpoints.js
import axios from 'axios';

const baseURL = process.env.TEST_BASE_URL || `http://localhost:${process.env.PORT || 8080}/api`;

async function testEndpoint(method, url, data = null) {
  try {
    const config = {
      method,
      url: `${baseURL}${url}`,
      data,
      timeout: 5000
    };
    
    const response = await axios(config);
    console.log(`✅ ${method} ${url} - Status: ${response.status}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.log(`❌ ${method} ${url} - Status: ${error.response.status}`);
      return error.response.data;
    } else {
      console.log(`❌ ${method} ${url} - Error: ${error.message}`);
      return { error: error.message };
    }
  }
}

async function runTests() {
  console.log('Testing BookHive Backend Endpoints...\n');
  
  // Test GET endpoints
  await testEndpoint('GET', '/auth/test');
  await testEndpoint('GET', '/stories/test');
  await testEndpoint('GET', '/users/test');
  
  // Test POST endpoints with sample data
  await testEndpoint('POST', '/auth/signup', {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  });
  
  await testEndpoint('POST', '/auth/login', {
    email: 'test@example.com',
    password: 'password123'
  });
  
  console.log('\n✅ All endpoint tests completed!');
}

runTests();