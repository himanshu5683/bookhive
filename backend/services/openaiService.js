// backend/services/openaiService.js - OpenAI Service for BookHive Chatbot

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client
let openai = null;

// Only initialize if API key is provided
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-actual-openai-api-key-here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Arrays of varied fallback responses to prevent repetitiveness
const quotaExceededResponses = [
  "I'm sorry, but I'm currently experiencing high demand and need to take a short break. Please try asking me again in a few moments!",
  "I'm getting quite a workout today! Mind giving me a quick breather before we continue?",
  "Wow, you're keeping me busy! Let's pause for a moment and try again shortly.",
  "I'm overwhelmed with questions right now. Please try again in a little while!",
  "I'm hitting my limit for now. Give me a minute to recharge and try again soon!"
];

const highDemandResponses = [
  "I'm experiencing high demand right now. Please wait a moment and try again.",
  "I'm juggling many conversations at once. Please be patient while I catch up!",
  "I'm quite popular today! Please give me a moment to respond.",
  "Many people are chatting with me right now. I'll be with you shortly!",
  "I'm working overtime to keep up with all these questions. Bear with me!"
];

const authErrorResponses = [
  "I'm temporarily having trouble accessing my knowledge base. Please try again in a moment!",
  "I seem to have misplaced my keys to the knowledge vault. Let me find them!",
  "My access seems to be blocked temporarily. I'm working on getting back in!",
  "I'm having trouble connecting to my brain right now. Please try again soon!",
  "I'm locked out of my knowledge base. Trying to get back in!"
];

const generalErrorResponses = [
  "I'm experiencing some technical difficulties right now. Please try asking me something else or come back later!",
  "I'm having a bit of a glitch. Try rephrasing your question or come back later!",
  "Something's not quite right with my circuits. Please try again in a bit!",
  "I seem to be having some issues. Mind trying again in a few minutes?",
  "I'm not feeling quite myself right now. Please check back with me later!"
];

// Helper function to get a random response from an array
const getRandomResponse = (responses) => {
  return responses[Math.floor(Math.random() * responses.length)];
};

/**
 * Generate AI response using OpenAI GPT
 * @param {string} message - User's message
 * @param {Array} history - Conversation history
 * @returns {Promise<string>} - Generated response
 */
const generateAIResponse = async (message, history = []) => {
  // Check if OpenAI is initialized
  if (!openai) {
    // Return a safe fallback response instead of throwing an error
    return "I'm currently unable to access advanced AI features. Please try again later or ask me something else!";
  }
  
  try {
    // Prepare the conversation history for OpenAI
    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant for BookHive, a collaborative learning platform for sharing educational resources. Help users find books, recommend resources, explain platform features, and assist with uploading/downloading content. Be friendly, informative, and encourage community participation."
      }
    ];

    // Add conversation history
    history.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Add the current user message
    messages.push({
      role: "user",
      content: message
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 500,
      temperature: 0.7
    });

    // Return the AI response
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Handle specific error cases safely
    if (error.status === 429) {
      if (error.error && error.error.code === 'insufficient_quota') {
        // Return a varied fallback response instead of throwing an error
        return getRandomResponse(quotaExceededResponses);
      } else {
        // Return a varied fallback response instead of throwing an error
        return getRandomResponse(highDemandResponses);
      }
    } else if (error.status === 401) {
      // Return a varied fallback response instead of throwing an error
      return getRandomResponse(authErrorResponses);
    } else {
      // Safe fallback response for all other errors
      return getRandomResponse(generalErrorResponses);
    }
  }
};

export default { generateAIResponse };