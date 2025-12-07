// Test script for inbuilt AI service
const { generateInbuiltAIResponse } = require('./services/inbuiltAI');

console.log('Testing inbuilt AI service...\n');

// Test cases
const testCases = [
  'hello',
  'how to upload book?',
  'recommend a novel',
  'how do I earn credits?',
  'what is BookHive?',
  'help me find programming books'
];

testCases.forEach((message, index) => {
  console.log(`Test ${index + 1}: "${message}"`);
  const response = generateInbuiltAIResponse(message, []);
  console.log(`Response: ${response}\n`);
});

console.log('Testing complete!');