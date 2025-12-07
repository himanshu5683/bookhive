// Test script to verify error handling in AI chat
const axios = require('axios');

async function testErrorCase() {
  console.log('Testing error case for AI chat...\n');
  
  try {
    // Send a very long message to potentially trigger issues
    let longMessage = "a";
    for (let i = 0; i < 10000; i++) {
      longMessage += "a";
    }
    
    console.log(`Sending long message (${longMessage.length} characters)`);
    
    const response = await axios.post('http://localhost:5002/api/ai/chat', {
      message: longMessage
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Reply length:', response.data.reply.length);
    console.log('Reply (first 100 chars):', response.data.reply.substring(0, 100));
    
  } catch (error) {
    console.log('❌ Error with long message');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
  
  console.log('\nTest completed!');
}

testErrorCase();