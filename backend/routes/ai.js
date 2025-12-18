import express from 'express';
import inbuiltAIService from '../services/inbuiltAI.js';
import openaiService from '../services/openaiService.js';
import authenticate from '../middleware/auth.js';

const { generateInbuiltAIResponse, generateResourceTags } = inbuiltAIService;
const { generateAIResponse } = openaiService;

// Store conversation history in memory (in production, you might want to use a database)
const conversationHistories = new Map();

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// POST /api/ai/auto-tag
// Generate tags for a resource based on its title and description
router.post("/auto-tag", async (req, res) => {
  try {
    const { title, description, userId } = req.body;
    
    // Validate required fields
    if (!title && !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Either title or description is required' 
      });
    }
    
    // Generate tags using inbuilt AI service
    const tags = generateResourceTags(title || '', description || '', 'General', 'Resource');
    
    return res.status(200).json({ 
      success: true, 
      tags: tags,
      message: 'Tags generated successfully'
    });
  } catch (err) {
    console.error("AI Auto-Tag Error:", err);
    // Always return a safe fallback response instead of throwing errors
    return res.status(200).json({ 
      success: false, 
      tags: [],
      message: "AI service unavailable, please try later" 
    });
  }
});

// POST /api/ai/trend-detection
// Detect trends based on user activity and preferences
router.post("/trend-detection", async (req, res) => {
  try {
    const { timeframe, userId } = req.body;
    
    // Validate required fields
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }
    
    // Sample trends data - in a real implementation, this would be based on actual data analysis
    const trends = [
      {
        term: "Machine Learning",
        volume: 1245,
        change: 15.2,
        category: "Technology"
      },
      {
        term: "Web Development",
        volume: 987,
        change: 8.7,
        category: "Programming"
      },
      {
        term: "Data Science",
        volume: 876,
        change: -2.3,
        category: "Analytics"
      },
      {
        term: "Mobile Apps",
        volume: 754,
        change: 12.1,
        category: "Development"
      }
    ];
    
    // Sample insights
    const insights = [
      {
        title: "Rising Interest in AI",
        description: "Machine Learning and Data Science topics are trending among users in your field."
      },
      {
        title: "Mobile Development Growth",
        description: "Mobile app development resources are seeing increased engagement."
      }
    ];
    
    return res.status(200).json({ 
      success: true, 
      trends: trends,
      insights: insights,
      message: 'Trends detected successfully'
    });
  } catch (err) {
    console.error("AI Trend Detection Error:", err);
    // Always return a safe fallback response instead of throwing errors
    return res.status(200).json({ 
      success: false, 
      trends: [],
      insights: [],
      message: "AI service unavailable, please try later" 
    });
  }
});

// POST /api/ai/sentiment-analysis
// Analyze the sentiment of provided text
router.post("/sentiment-analysis", async (req, res) => {
  try {
    const { text, userId } = req.body;
    
    // Validate required fields
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        message: 'Text is required for sentiment analysis' 
      });
    }
    
    // In a real implementation, this would use OpenAI or another service
    // For now, we'll simulate sentiment analysis
    
    // Simple sentiment analysis based on keywords
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'pleased'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'sad', 'angry', 'frustrated', 'disappointed'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    // Calculate sentiment score (0 to 1, 0.5 is neutral)
    const total = positiveCount + negativeCount;
    let score = 0.5; // Neutral by default
    
    if (total > 0) {
      score = 0.5 + ((positiveCount - negativeCount) / (total * 2));
      // Clamp between 0 and 1
      score = Math.max(0, Math.min(1, score));
    }
    
    // Extract keywords
    const keywords = [...positiveWords, ...negativeWords].filter(word => text.toLowerCase().includes(word));
    
    return res.status(200).json({ 
      success: true, 
      score: score,
      confidence: Math.min(0.9, total / 10), // Confidence based on keyword count
      keywords: keywords.slice(0, 5), // Limit to top 5 keywords
      message: 'Sentiment analyzed successfully'
    });
  } catch (err) {
    console.error("AI Sentiment Analysis Error:", err);
    // Always return a safe fallback response instead of throwing errors
    return res.status(200).json({ 
      success: false, 
      score: 0.5,
      confidence: 0,
      keywords: [],
      message: "AI service unavailable, please try later" 
    });
  }
});

// POST /api/ai/event-suggestions
// Generate event suggestions based on user preferences
router.post("/event-suggestions", async (req, res) => {
  try {
    const { interests, preferredFormats, availability, userId } = req.body;
    
    // Validate required fields
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }
    
    // In a real implementation, you would generate personalized event suggestions
    // For now, we'll return sample suggestions
    const events = [
      {
        title: "Online Coding Workshop",
        type: "workshop",
        date: "2023-06-15",
        startTime: "14:00",
        endTime: "16:00",
        location: "Virtual Zoom Room",
        format: "online",
        description: "Learn modern JavaScript frameworks and best practices for web development.",
        matchReason: "Matches your interest in web development"
      },
      {
        title: "Book Club Meeting",
        type: "study_group",
        date: "2023-06-10",
        startTime: "18:00",
        endTime: "19:30",
        location: "Main Library Reading Room",
        format: "in_person",
        description: "Monthly discussion of classic literature and contemporary fiction.",
        matchReason: "Matches your interest in literature"
      },
      {
        title: "Tech Talk Series",
        type: "webinar",
        date: "2023-06-20",
        startTime: "19:00",
        endTime: "20:30",
        location: "Online Platform",
        format: "online",
        description: "Expert speakers discuss emerging technologies and their applications.",
        matchReason: "Matches your interest in technology"
      }
    ];
    
    return res.status(200).json({ 
      success: true, 
      events: events,
      message: 'Event suggestions generated successfully'
    });
  } catch (err) {
    console.error("AI Event Suggestions Error:", err);
    // Always return a safe fallback response instead of throwing errors
    return res.status(200).json({ 
      success: false, 
      events: [],
      message: "AI service unavailable, please try later" 
    });
  }
});

// POST /api/ai/summarize
// Generate a summary of provided text
router.post("/summarize", async (req, res) => {
  try {
    const { text, maxLength, userId } = req.body;
    
    // Validate required fields
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        message: 'Text is required for summarization' 
      });
    }
    
    // Check minimum length
    const wordCount = text.split(' ').length;
    if (wordCount < 20) {
      return res.status(400).json({ 
        success: false, 
        message: 'Text must be at least 20 words for summarization' 
      });
    }
    
    // Try to generate summary using OpenAI
    try {
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
        const summaryPrompt = `Please summarize the following text in ${maxLength || 100} words or less:\n\n${text}`;
        const summaryResponse = await generateAIResponse(summaryPrompt, []);
        
        return res.status(200).json({ 
          success: true, 
          summary: summaryResponse,
          message: 'Summary generated successfully'
        });
      }
    } catch (openAiError) {
      console.warn("OpenAI summarization failed:", openAiError.message);
      // Continue to fallback
    }
    
    // Fallback: Simple extractive summarization
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // For very short texts, just return a truncated version
    if (sentences.length <= 2) {
      const summary = text.length > 200 ? text.substring(0, 200) + '...' : text;
      return res.status(200).json({ 
        success: true, 
        summary: summary,
        message: 'Summary generated successfully'
      });
    }
    
    // Select key sentences (first, middle, last)
    const firstSentence = sentences[0];
    const middleSentence = sentences[Math.floor(sentences.length / 2)];
    const lastSentence = sentences[sentences.length - 1];
    
    // Create summary
    let summary = `${firstSentence}. ${middleSentence}. ${lastSentence}.`;
    
    // Truncate if needed
    if (maxLength) {
      const words = summary.split(' ');
      if (words.length > maxLength) {
        summary = words.slice(0, maxLength).join(' ') + '...';
      }
    }
    
    return res.status(200).json({ 
      success: true, 
      summary: summary,
      message: 'Summary generated successfully'
    });
  } catch (err) {
    console.error("AI Summarization Error:", err);
    // Always return a safe fallback response instead of throwing errors
    return res.status(200).json({ 
      success: false, 
      summary: '',
      message: "AI service unavailable, please try later" 
    });
  }
});

// POST /api/ai/recommendations
// Generate personalized recommendations for the user
router.post("/recommendations", async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Validate required fields
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }
    
    // In a real implementation, you would fetch user data and generate personalized recommendations
    // For now, we'll return sample recommendations
    const recommendations = [
      {
        title: "JavaScript: The Good Parts",
        author: "Douglas Crockford",
        description: "A detailed look at the good parts of JavaScript and a survey of the bad parts.",
        genre: "Programming",
        reasoning: "Based on your interest in web development"
      },
      {
        title: "Clean Code",
        author: "Robert C. Martin",
        description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees.",
        genre: "Software Engineering",
        reasoning: "Recommended for improving coding practices"
      },
      {
        title: "Design Patterns",
        author: "Gang of Four",
        description: "Capturing reusable object-oriented design expertise, this book catalogs proven techniques for making designs more flexible and elegant.",
        genre: "Software Architecture",
        reasoning: "To enhance your software design skills"
      }
    ];
    
    return res.status(200).json({ 
      success: true, 
      recommendations: recommendations,
      message: 'Recommendations generated successfully'
    });
  } catch (err) {
    console.error("AI Recommendations Error:", err);
    // Always return a safe fallback response instead of throwing errors
    return res.status(200).json({ 
      success: false, 
      recommendations: [],
      message: "AI service unavailable, please try later" 
    });
  }
});

// POST /api/ai/chat
// Chat with the AI assistant
router.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const userId = req.user.id; // Using id from authenticated user (as requested)
    const user = req.user; // User object from authentication

    if (!userMessage) {
      return res.status(400).json({ reply: "Please type a message." });
    }

    // Get or initialize conversation history for this user
    let history = conversationHistories.get(userId) || [];
    
    // Add user message to history
    history.push({
      role: "user",
      content: userMessage,
      timestamp: new Date()
    });

    // Keep only the last 10 messages to avoid context overflow
    if (history.length > 10) {
      history = history.slice(-10);
    }

    // Try to generate AI response using OpenAI
    let reply;
    try {
      reply = await generateAIResponse(userMessage, history);
    } catch (openAiError) {
      console.warn("OpenAI failed, falling back to inbuilt AI:", openAiError.message);
      // Fallback to inbuilt rule-based logic
      reply = generateInbuiltAIResponse(userMessage, history, user);
    }

    // Add AI response to history
    history.push({
      role: "assistant",
      content: reply,
      timestamp: new Date()
    });

    // Save updated history
    conversationHistories.set(userId, history);

    return res.json({ reply });

  } catch (err) {
    console.error("AI Chat Error:", err);
    // Always return a safe fallback response instead of throwing errors
    return res.json({ reply: "Something went wrong, try again!" });
  }
});

export default router;