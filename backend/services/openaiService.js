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
        // Return a safe fallback response instead of throwing an error
        return "I'm sorry, but I'm currently experiencing high demand and need to take a short break. Please try asking me again in a few moments!";
      } else {
        // Return a safe fallback response instead of throwing an error
        return "I'm experiencing high demand right now. Please wait a moment and try again.";
      }
    } else if (error.status === 401) {
      // Return a safe fallback response instead of throwing an error
      return "I'm temporarily having trouble accessing my knowledge base. Please try again in a moment!";
    } else {
      // Safe fallback response for all other errors
      return "I'm experiencing some technical difficulties right now. Please try asking me something else or come back later!";
    }
  }
};

export default { generateAIResponse };