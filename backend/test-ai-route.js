// Test script for AI route
const express = require('express');
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
      
      console.log(`✅ Success: ${response.data.reply}\n`);
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
  
  console.log('Test completed!');
}

testAIEndpoint();