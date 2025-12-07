// Test script for AI chat endpoint
const axios = require('axios');

async function testAIChat() {
  console.log('Testing AI chat endpoint...\n');
  
  const testMessages = [
    "hello",
    "hi there",
    "recommend a book",
    "help me",
    "thanks",
    "bye",
    "random message"
  ];
  
  for (const message of testMessages) {
    try {
      console.log(`Sending message: "${message}"`);
      
      const response = await axios.post('http://localhost:5002/api/ai/chat', {
        message: message
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Success!');
      console.log('Status:', response.status);
      console.log('Reply:', response.data.reply);
      console.log('---');
      
    } catch (error) {
      console.log('❌ Error with message:', message);
      console.log('Error:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', error.response.data);
      }
      console.log('---');
    }
  }
  
  console.log('\nTest completed!');
}

testAIChat();