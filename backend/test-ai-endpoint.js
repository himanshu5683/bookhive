// Test script for AI endpoint
import axios from 'axios';

const BASE_URL = process.env.TEST_BASE_URL || `http://localhost:${process.env.PORT || 8080}`;

async function testAIEndpoint() {
  console.log('Testing AI endpoint...\n');
  
  try {
    console.log('Sending test message: "hi"');
    
    const response = await axios.post(`${BASE_URL}/api/ai/chat`, {
      message: "hi"
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Success!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    // Check if response has the correct format
    if (response.data && response.data.reply) {
      console.log('✅ Response format is correct');
      console.log('Expected reply:', "Hi there! How can I help you today?");
      console.log('Actual reply:', response.data.reply);
    } else {
      console.log('❌ Response format is incorrect');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
    if (error.request) {
      console.log('No response received:', error.request);
    }
  }
  
  // Test another message
  try {
    console.log('\nSending test message: "recommend a book"');
    
    const response = await axios.post(`${BASE_URL}/api/ai/chat`, {
      message: "recommend a book"
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Success!');
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }
  
  console.log('\nTest completed!');
}

testAIEndpoint();