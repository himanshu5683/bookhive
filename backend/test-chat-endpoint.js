// Test script for the new chat endpoint
const express = require('express');
const axios = require('axios');

async function testChatEndpoint() {
  console.log('Testing new AI chat endpoint...\n');
  
  const testCases = [
    { message: "hi", description: "Greeting" },
    { message: "recommend a book", description: "Book recommendation" },
    { message: "help me", description: "Help request" },
    { message: "what is this platform", description: "Platform info" }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.description} ("${testCase.message}")`);
      
      const response = await axios.post('http://localhost:5002/api/ai/chat', {
        message: testCase.message
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log(`✅ Success: ${response.data.reply}\n`);
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
  
  console.log('Test completed!');
}

testChatEndpoint();