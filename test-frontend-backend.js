// Test script to verify frontend can communicate with backend
const axios = require('axios');

async function testChatbot() {
  try {
    console.log('Testing chatbot communication...');
    
    // Test the local development endpoint
    const response = await axios.post('http://localhost:5002/api/ai/chat', {
      message: 'Hello, how are you?'
    });
    
    console.log('Success! Response from backend:');
    console.log(response.data);
    
    // Test with different message
    const response2 = await axios.post('http://localhost:5002/api/ai/chat', {
      message: 'Can you recommend some programming books?'
    });
    
    console.log('\nSecond test response:');
    console.log(response2.data);
    
  } catch (error) {
    console.error('Error testing chatbot:');
    console.error('Error details:', error);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testChatbot();