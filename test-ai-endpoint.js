// Test script to verify AI endpoint is working
const axios = require('axios');

async function testAIEndpoint() {
  console.log('Testing AI endpoint...\n');
  
  const testCases = [
    { message: "hello", description: "Greeting" },
    { message: "recommend a book", description: "Book recommendation" },
    { message: "how do I upload a resource", description: "Upload instructions" }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.description} ("${testCase.message}")`);
      
      const response = await axios.post('https://bookhive-backend-production.up.railway.app/api/ai/chat', {
        message: testCase.message,
        history: []
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      if (response.data && response.data.reply) {
        console.log(`✅ Success: Received reply from backend`);
        console.log(`   Reply: ${response.data.reply.substring(0, 100)}${response.data.reply.length > 100 ? '...' : ''}\n`);
      } else {
        console.log(`❌ Error: Unexpected response format\n`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
  
  console.log('Test completed!');
}

testAIEndpoint();