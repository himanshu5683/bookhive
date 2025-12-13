// Test script to verify BookHive backend deployment
const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_URL || 'https://bookhive-backend-production.up.railway.app/api';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword123';
const TEST_NAME = process.env.TEST_NAME || 'Test User';

console.log('Testing BookHive Backend Deployment');
console.log('=====================================');
console.log('API Base URL:', API_BASE_URL);
console.log();

// Test health endpoint
async function testHealthEndpoint() {
    try {
        console.log('1. Testing health endpoint...');
        const response = await axios.get(`${API_BASE_URL}/health`);
        console.log('   ✓ Health check successful');
        console.log('   Status:', response.data.status);
        console.log('   DB Status:', response.data.db);
        console.log();
        return true;
    } catch (error) {
        console.log('   ✗ Health check failed');
        console.log('   Error:', error.message);
        console.log();
        return false;
    }
}

// Test root endpoint
async function testRootEndpoint() {
    try {
        console.log('2. Testing root endpoint...');
        const response = await axios.get(API_BASE_URL.replace('/api', ''));
        console.log('   ✓ Root endpoint successful');
        console.log('   Status:', response.data.status);
        console.log('   Message:', response.data.message);
        console.log();
        return true;
    } catch (error) {
        console.log('   ✗ Root endpoint failed');
        console.log('   Error:', error.message);
        console.log();
        return false;
    }
}

// Test auth endpoints
async function testAuthEndpoints() {
    try {
        console.log('3. Testing auth endpoints...');
        
        // Test signup endpoint (expect 400 for missing fields or 201 for success)
        try {
            await axios.post(`${API_BASE_URL}/auth/signup`, {});
            console.log('   ✗ Signup should have failed for empty data');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('   ✓ Signup correctly rejected empty data');
            } else {
                console.log('   ! Unexpected response for signup:', error.response?.status);
            }
        }
        
        // Test login endpoint (expect 400 for missing fields or 401 for invalid credentials)
        try {
            await axios.post(`${API_BASE_URL}/auth/login`, {});
            console.log('   ✗ Login should have failed for empty data');
        } catch (error) {
            if (error.response && (error.response.status === 400 || error.response.status === 401)) {
                console.log('   ✓ Login correctly rejected empty data');
            } else {
                console.log('   ! Unexpected response for login:', error.response?.status);
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
        testHealthEndpoint,
        testRootEndpoint,
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
        console.log('🎉 All tests passed! Your backend is ready for Railway deployment.');
    } else {
        console.log('⚠️  Some tests failed. Please check the output above.');
    }
}

// Run the tests
runTests().catch(error => {
    console.error('Test suite failed with error:', error);
});