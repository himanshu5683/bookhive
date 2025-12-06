// backend/routes/ai.js - AI Features Routes

const express = require('express');
const { OpenAI } = require('openai');
require('dotenv').config();

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/ai/recommendations
 * Get book recommendations based on user preferences
 * Body: { genre, interests, history }
 */
router.post('/recommendations', async (req, res) => {
  try {
    const { genre, interests, history } = req.body;
    
    // Validate input
    if (!genre && !interests && !history) {
      return res.status(400).json({ error: 'At least one parameter required: genre, interests, or history' });
    }

    // Create prompt for OpenAI
    const prompt = `Recommend 5 books based on the following criteria:
Genre: ${genre || 'any'}
Interests: ${interests || 'general'}
Reading History: ${history || 'none'}

Return the recommendations as a JSON array with the following format:
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "description": "Brief description of the book",
    "genre": "Book Genre"
  }
]`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful book recommendation assistant. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Parse the response
    const responseText = completion.choices[0].message.content;
    
    // Try to parse as JSON, fallback to manual extraction if needed
    let recommendations;
    try {
      recommendations = JSON.parse(responseText);
    } catch (parseError) {
      // If JSON parsing fails, try to extract from markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        recommendations = JSON.parse(jsonMatch[1]);
      } else {
        // Fallback to basic parsing
        recommendations = [{ 
          title: "Sample Book", 
          author: "Sample Author", 
          description: "This is a sample recommendation.", 
          genre: genre || "General" 
        }];
      }
    }

    res.status(200).json({
      recommendations
    });
  } catch (error) {
    console.error('AI Recommendation Error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

/**
 * POST /api/ai/chat
 * Chat with AI assistant about books
 * Body: { message, context }
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create prompt for OpenAI
    const prompt = `You are a helpful book assistant for BookHive, an online library platform.
User Message: ${message}
${context ? `Context: ${context}` : ''}

Provide a helpful and concise response.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful book assistant for BookHive, an online library platform. Keep responses concise and helpful."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseText = completion.choices[0].message.content;

    res.status(200).json({
      response: responseText
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

/**
 * POST /api/ai/summarize
 * Summarize book descriptions
 * Body: { text, maxLength }
 */
router.post('/summarize', async (req, res) => {
  try {
    const { text, maxLength = 100 } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Create prompt for OpenAI
    const prompt = `Summarize the following book description in ${maxLength} words or less:
${text}`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes book descriptions concisely."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const summary = completion.choices[0].message.content;

    res.status(200).json({
      summary
    });
  } catch (error) {
    console.error('AI Summarization Error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

/**
 * POST /api/ai/search
 * Enhanced search with AI-powered NLP
 * Body: { query, filters }
 */
router.post('/search', async (req, res) => {
  try {
    const { query, filters } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Create prompt for OpenAI to extract search parameters
    const prompt = `Extract search parameters from the following query:
Query: ${query}
${filters ? `Existing Filters: ${JSON.stringify(filters)}` : ''}

Return a JSON object with extracted information:
{
  "keywords": ["keyword1", "keyword2"],
  "genres": ["genre1", "genre2"],
  "authors": ["author1", "author2"],
  "title": "specific title if mentioned"
}`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that extracts search parameters from natural language queries. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    // Parse the response
    const responseText = completion.choices[0].message.content;
    
    // Try to parse as JSON
    let searchParams;
    try {
      searchParams = JSON.parse(responseText);
    } catch (parseError) {
      // If JSON parsing fails, try to extract from markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        searchParams = JSON.parse(jsonMatch[1]);
      } else {
        // Fallback to basic parsing
        searchParams = { 
          keywords: [query], 
          genres: [], 
          authors: [], 
          title: "" 
        };
      }
    }

    res.status(200).json({
      searchParams
    });
  } catch (error) {
    console.error('AI Search Error:', error);
    res.status(500).json({ error: 'Failed to process search query' });
  }
});

module.exports = router;