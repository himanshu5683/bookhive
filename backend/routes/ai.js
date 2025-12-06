// backend/routes/ai.js - AI Features Routes

const express = require('express');
const { OpenAI } = require('openai');
const User = require('../models/User');
const Resource = require('../models/Resource');
require('dotenv').config();

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/ai/recommendations
 * Get book recommendations based on user preferences
 * Body: { genre, interests, history, userId }
 */
router.post('/recommendations', async (req, res) => {
  try {
    const { genre, interests, history, userId } = req.body;
    
    // Validate input
    if (!genre && !interests && !history && !userId) {
      return res.status(400).json({ error: 'At least one parameter required: genre, interests, history, or userId' });
    }

    let prompt = '';
    
    // If userId is provided, get personalized recommendations
    if (userId) {
      // Fetch user data
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Fetch user's uploaded resources
      const userResources = await Resource.find({ authorId: userId }).limit(10);
      
      // Create personalized prompt
      prompt = `Recommend 5 books based on this user's profile and activity:
User Name: ${user.name}
User Tags/Interests: ${user.tags ? user.tags.join(', ') : 'None'}
User Bio: ${user.bio || 'No bio provided'}

Recently Uploaded Resources by User:
${userResources.map(r => `- ${r.title} (${r.category})`).join('\n') || 'None'}

${genre ? `Preferred Genre: ${genre}` : ''}
${interests ? `Additional Interests: ${interests}` : ''}
${history ? `Reading History: ${history}` : ''}

Return the recommendations as a JSON array with the following format:
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "description": "Brief description of the book",
    "genre": "Book Genre",
    "reasoning": "Why this book is recommended for this user"
  }
]`;
    } else {
      // Standard recommendations
      prompt = `Recommend 5 books based on the following criteria:
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
    }

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
      max_tokens: 1500,
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
 * POST /api/ai/generate-tags
 * Generate tags based on content and user activity
 * Body: { content, type, existingTags, userId }
 */
router.post('/generate-tags', async (req, res) => {
  try {
    const { content, type, existingTags = [], userId } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    let prompt = '';
    
    // If userId is provided, personalize tag generation
    if (userId) {
      // Fetch user data
      const user = await User.findById(userId);
      if (user) {
        prompt = `Based on the following ${type || 'content'} and this user's interests, generate 5-10 relevant tags:
Content: ${content}
User Name: ${user.name}
User Tags/Interests: ${user.tags ? user.tags.join(', ') : 'None'}
User Bio: ${user.bio || 'No bio provided'}
${existingTags.length > 0 ? `Existing tags: ${existingTags.join(', ')}` : ''}

Return the tags as a JSON array with the following format:
[
  "tag1",
  "tag2",
  "tag3"
]`;
      } else {
        // Fallback if user not found
        prompt = `Based on the following ${type || 'content'}, generate 5-10 relevant tags:
Content: ${content}
${existingTags.length > 0 ? `Existing tags: ${existingTags.join(', ')}` : ''}

Return the tags as a JSON array with the following format:
[
  "tag1",
  "tag2",
  "tag3"
]`;
      }
    } else {
      // Standard tag generation
      prompt = `Based on the following ${type || 'content'}, generate 5-10 relevant tags:
Content: ${content}
${existingTags.length > 0 ? `Existing tags: ${existingTags.join(', ')}` : ''}

Return the tags as a JSON array with the following format:
[
  "tag1",
  "tag2",
  "tag3"
]`;
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates relevant tags for content. Always respond with valid JSON array of tags."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 300,
    });

    // Parse the response
    const responseText = completion.choices[0].message.content;
    
    // Try to parse as JSON
    let tags;
    try {
      tags = JSON.parse(responseText);
    } catch (parseError) {
      // If JSON parsing fails, try to extract from markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        tags = JSON.parse(jsonMatch[1]);
      } else {
        // Fallback to basic parsing
        tags = ['general'];
      }
    }

    res.status(200).json({
      tags
    });
  } catch (error) {
    console.error('AI Tag Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate tags' });
  }
});

/**
 * POST /api/ai/chat
 * Chat with AI assistant about books
 * Body: { message, context, userId }
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, context, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let prompt = '';
    
    // If userId is provided, personalize the chat
    if (userId) {
      // Fetch user data
      const user = await User.findById(userId);
      if (user) {
        prompt = `You are a helpful book assistant for BookHive, an online library platform.
User Name: ${user.name}
User Tags/Interests: ${user.tags ? user.tags.join(', ') : 'None'}
User Bio: ${user.bio || 'No bio provided'}

User Message: ${message}
${context ? `Context: ${context}` : ''}

Provide a helpful and concise response tailored to this user's interests.`;
      } else {
        // Fallback if user not found
        prompt = `You are a helpful book assistant for BookHive, an online library platform.
User Message: ${message}
${context ? `Context: ${context}` : ''}

Provide a helpful and concise response.`;
      }
    } else {
      // Standard chat
      prompt = `You are a helpful book assistant for BookHive, an online library platform.
User Message: ${message}
${context ? `Context: ${context}` : ''}

Provide a helpful and concise response.`;
    }

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
 * Body: { query, filters, userId }
 */
router.post('/search', async (req, res) => {
  try {
    const { query, filters, userId } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    let prompt = '';
    
    // If userId is provided, personalize the search
    if (userId) {
      // Fetch user data
      const user = await User.findById(userId);
      if (user) {
        prompt = `Extract search parameters from the following query, considering this user's interests:
User Name: ${user.name}
User Tags/Interests: ${user.tags ? user.tags.join(', ') : 'None'}

Query: ${query}
${filters ? `Existing Filters: ${JSON.stringify(filters)}` : ''}

Return a JSON object with extracted information:
{
  "keywords": ["keyword1", "keyword2"],
  "genres": ["genre1", "genre2"],
  "authors": ["author1", "author2"],
  "title": "specific title if mentioned"
}`;
      } else {
        // Fallback if user not found
        prompt = `Extract search parameters from the following query:
Query: ${query}
${filters ? `Existing Filters: ${JSON.stringify(filters)}` : ''}

Return a JSON object with extracted information:
{
  "keywords": ["keyword1", "keyword2"],
  "genres": ["genre1", "genre2"],
  "authors": ["author1", "author2"],
  "title": "specific title if mentioned"
}`;
      }
    } else {
      // Standard search parameter extraction
      prompt = `Extract search parameters from the following query:
Query: ${query}
${filters ? `Existing Filters: ${JSON.stringify(filters)}` : ''}

Return a JSON object with extracted information:
{
  "keywords": ["keyword1", "keyword2"],
  "genres": ["genre1", "genre2"],
  "authors": ["author1", "author2"],
  "title": "specific title if mentioned"
}`;
    }

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