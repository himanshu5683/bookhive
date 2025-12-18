// Test script for all AI endpoints
import axios from 'axios';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:8080';
const TEST_USER_ID = 'test-user-id';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true
});

// Add request interceptor to simulate auth (in real app, you'd login first)
apiClient.interceptors.request.use(
  (config) => {
    // Simulate adding auth token (in real scenario, you'd get this from login)
    // For testing purposes, we'll bypass auth by modifying the request
    console.log(`Making request to: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

async function testAIEndpoints() {
  console.log('🧪 Testing all AI endpoints...\n');
  
  // Test data
  const testData = {
    autoTag: {
      title: "JavaScript Basics",
      description: "Learn the fundamentals of JavaScript programming including variables, functions, and objects."
    },
    trendDetection: {
      timeframe: "month"
    },
    sentimentAnalysis: {
      text: "This book is absolutely fantastic! I learned so much from it."
    },
    eventSuggestions: {
      interests: "JavaScript, Web Development",
      preferredFormats: ["Online", "In-person"],
      availability: "all"
    },
    summarize: {
      text: "Artificial Intelligence (AI) is transforming the way we live, work, and interact with technology. From virtual assistants like Siri and Alexa to recommendation systems on Netflix and Amazon, AI has become an integral part of our daily lives. In the healthcare industry, AI is being used to diagnose diseases, develop new drugs, and personalize treatment plans. Financial institutions leverage AI for fraud detection, algorithmic trading, and customer service automation. The automotive industry is investing heavily in AI for autonomous vehicles, which promise to revolutionize transportation. Despite its benefits, AI also raises ethical concerns about job displacement, privacy, and decision-making transparency. As AI continues to evolve, it is crucial to develop responsible AI practices that prioritize human welfare and societal good.",
      maxLength: 50
    },
    recommendations: {},
    chat: {
      message: "Hi, can you recommend some good programming books?"
    }
  };

  // List of endpoints to test
  const endpoints = [
    {
      name: 'Auto-Tag',
      path: '/api/ai/auto-tag',
      method: 'post',
      data: testData.autoTag
    },
    {
      name: 'Trend Detection',
      path: '/api/ai/trend-detection',
      method: 'post',
      data: testData.trendDetection
    },
    {
      name: 'Sentiment Analysis',
      path: '/api/ai/sentiment-analysis',
      method: 'post',
      data: testData.sentimentAnalysis
    },
    {
      name: 'Event Suggestions',
      path: '/api/ai/event-suggestions',
      method: 'post',
      data: testData.eventSuggestions
    },
    {
      name: 'Summarize',
      path: '/api/ai/summarize',
      method: 'post',
      data: testData.summarize
    },
    {
      name: 'Recommendations',
      path: '/api/ai/recommendations',
      method: 'post',
      data: testData.recommendations
    },
    {
      name: 'Chat',
      path: '/api/ai/chat',
      method: 'post',
      data: testData.chat
    }
  ];

  let passedTests = 0;
  let totalTests = endpoints.length;

  // Test each endpoint
  for (const endpoint of endpoints) {
    try {
      console.log(` Testing ${endpoint.name}...`);
      
      // For testing purposes, we'll skip authentication by directly testing the route logic
      // In a real application, you would need to be logged in
      const response = await apiClient.post(
        endpoint.path,
        { ...endpoint.data, userId: TEST_USER_ID },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200) {
        console.log(` ✅ ${endpoint.name}: Success`);
        console.log(`    Status: ${response.status}`);
        console.log(`    Response keys: ${Object.keys(response.data).join(', ')}`);
        passedTests++;
      } else {
        console.log(` ❌ ${endpoint.name}: Unexpected status ${response.status}`);
      }
    } catch (error) {
      console.log(` ❌ ${endpoint.name}: Error - ${error.message}`);
      if (error.response) {
        console.log(`    Status: ${error.response.status}`);
        console.log(`    Data: ${JSON.stringify(error.response.data)}`);
      }
    }
    console.log('');
  }

  // Summary
  console.log('📋 TEST SUMMARY');
  console.log('==============');
  console.log(`Passed: ${passedTests}/${totalTests}`);
  console.log(`Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All AI endpoints are working correctly!');
  } else {
    console.log('\n⚠️  Some AI endpoints need attention.');
  }
}

// Run the tests
testAIEndpoints().catch(console.error);