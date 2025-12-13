// test-health-endpoint.js - Test the health endpoint
import axios from 'axios';

const baseURL = process.env.TEST_BASE_URL || 'http://localhost:8080';

async function testHealthEndpoint() {
  try {
    console.log('Testing BookHive Health Endpoint...\n');
    
    const response = await axios.get(`${baseURL}/api/health`, {
      timeout: 5000
    });
    
    console.log(`✅ GET /api/health - Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.status === 'ok') {
      console.log('\n🎉 Health endpoint is working correctly!');
      return true;
    } else {
      console.log('\n❌ Health endpoint returned unexpected response');
      return false;
    }
  } catch (error) {
    if (error.response) {
      console.log(`❌ GET /api/health - Status: ${error.response.status}`);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(`❌ GET /api/health - Error: ${error.message}`);
    }
    return false;
  }
}

// Run the test
testHealthEndpoint().then(success => {
  if (success) {
    console.log('\n✅ Health endpoint test passed!');
  } else {
    console.log('\n❌ Health endpoint test failed!');
  }
});