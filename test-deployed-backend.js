// Test script to verify deployed BookHive backend functionality
const axios = require('axios');

// Configuration - Update this to match your actual Railway deployment URL
const DEPLOYED_BACKEND_URL = 'https://bookhive-production-9463.up.railway.app';
const API_BASE_URL = `${DEPLOYED_BACKEND_URL}/api`;

console.log('Testing Deployed BookHive Backend');
console.log('================================');
console.log('Backend URL:', DEPLOYED_BACKEND_URL);
console.log('API Base URL:', API_BASE_URL);
console.log();

// Test root endpoint
async function testRootEndpoint() {
    try {
        console.log('1. Testing root endpoint...');
        const response = await axios.get(DEPLOYED_BACKEND_URL);
        console.log('   ✓ Root endpoint successful');
        console.log('   Status:', response.data.status);
        console.log('   Message:', response.data.message);
        console.log();
        return true;
    } catch (error) {
        console.log('   ✗ Root endpoint failed');
        console.log('   Error:', error.message);
        if (error.response) {
            console.log('   Response Status:', error.response.status);
            console.log('   Response Data:', JSON.stringify(error.response.data, null, 2));
        }
        console.log();
        return false;
    }
}

// Test health endpoint
async function testHealthEndpoint() {
    try {
        console.log('2. Testing health endpoint...');
        const response = await axios.get(`${API_BASE_URL}/health`);
        console.log('   ✓ Health check successful');
        console.log('   Status:', response.data.status);
        console.log('   DB Status:', response.data.db);
        console.log();
        return true;
    } catch (error) {
        console.log('   ✗ Health check failed');
        console.log('   Error:', error.message);
        if (error.response) {
            console.log('   Response Status:', error.response.status);
            console.log('   Response Data:', JSON.stringify(error.response.data, null, 2));
        }
        console.log();
        return false;
    }
}

// Test auth endpoints
async function testAuthEndpoints() {
    try {
        console.log('3. Testing auth endpoints...');
        
        // Test signup endpoint (expect 400 for missing fields)
        try {
            await axios.post(`${API_BASE_URL}/auth/signup`, {});
            console.log('   ✗ Signup should have failed for empty data');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('   ✓ Signup correctly rejected empty data');
            } else {
                console.log('   ! Unexpected response for signup:', error.response?.status);
                if (error.response) {
                    console.log('   Response Data:', JSON.stringify(error.response.data, null, 2));
                }
            }
        }
        
        // Test login endpoint (expect 400 for missing fields)
        try {
            await axios.post(`${API_BASE_URL}/auth/login`, {});
            console.log('   ✗ Login should have failed for empty data');
        } catch (error) {
            if (error.response && (error.response.status === 400 || error.response.status === 401)) {
                console.log('   ✓ Login correctly rejected empty data');
            } else {
                console.log('   ! Unexpected response for login:', error.response?.status);
                if (error.response) {
                    console.log('   Response Data:', JSON.stringify(error.response.data, null, 2));
                }
            }
        }
        
        console.log();
        return true;
    } catch (error) {
        console.log('   ✗ Auth endpoints test failed');
        console.log('   Error:', error.message);
        console.log();
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('Starting BookHive Backend Tests...\n');
    
    const tests = [
        testRootEndpoint,
        testHealthEndpoint,
        testAuthEndpoints
    ];
    
    let passedTests = 0;
    
    for (const test of tests) {
        try {
            const result = await test();
            if (result) passedTests++;
        } catch (error) {
            console.log('Test failed with exception:', error.message);
        }
    }
    
    console.log('=====================================');
    console.log(`Tests completed: ${passedTests}/${tests.length} passed`);
    
    if (passedTests === tests.length) {
        console.log('🎉 All tests passed! Your deployed backend is working correctly.');
        console.log('\nNext steps:');
        console.log('1. Set up the required environment variables in Railway as described in RAILWAY_ENV_SETUP.md');
        console.log('2. Test authentication with valid credentials');
        console.log('3. Verify OAuth integrations if you\'re using them');
        console.log('4. Connect your frontend to this backend');
    } else {
        console.log('⚠️  Some tests failed. Please check the output above and verify your deployment.');
    }
}

// Run the tests
runTests().catch(error => {
    console.error('Test suite failed with error:', error);
});