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
    throw new Error('OpenAI API key not configured');
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
    
    // Provide more specific error messages based on the error type
    if (error.status === 429) {
      if (error.error && error.error.code === 'insufficient_quota') {
        return "I'm sorry, but the AI service is currently unavailable due to quota limitations. Please contact the site administrator to resolve this issue.";
      } else {
        return "I'm experiencing high demand right now. Please wait a moment and try again.";
      }
    } else if (error.status === 401) {
      return "I'm currently experiencing authentication issues. Please contact the site administrator.";
    } else {
      // Safe fallback response
      return "I'm currently experiencing some technical difficulties. Please try again in a moment, or feel free to ask me about books, resources, or how to use BookHive!";
    }
  }
};

export { generateAIResponse };