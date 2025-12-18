import express from 'express';
import inbuiltAIService from '../services/inbuiltAI.js';
const { generateInbuiltAIResponse } = inbuiltAIService;
import openaiService from '../services/openaiService.js';
const { generateAIResponse } = openaiService;
import authenticate from '../middleware/auth.js';

// Store conversation history in memory (in production, you might want to use a database)
const conversationHistories = new Map();

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// POST /api/ai/event-suggestions
// Generate event suggestions based on user preferences
router.post("/event-suggestions", async (req, res) => {
  try {
    const { interests, preferredFormats, availability, userId } = req.body;
    
    // Validate required fields
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    // In a real implementation, you would generate personalized event suggestions
    // For now, we'll return sample suggestions
    const suggestions = [
      {
        title: "Online Coding Workshop",
        category: "Programming",
        format: "Online",
        date: "Next Weekend"
      },
      {
        title: "Book Club Meeting",
        category: "Literature",
        format: "In-person",
        date: "This Friday"
      },
      {
        title: "Tech Talk Series",
        category: "Technology",
        format: "Online",
        date: "Next Tuesday"
      }
    ];
    
    return res.status(200).json({ success: true, suggestions });
  } catch (err) {
    console.error("AI Event Suggestions Error:", err);
    // Always return a safe fallback response instead of throwing errors
    return res.status(200).json({ success: true, suggestions: [] });
  }
});

// POST /api/ai/recommendations
// Generate personalized recommendations for the user
router.post("/recommendations", async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Validate required fields
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
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
    
    return res.json({ recommendations });
  } catch (err) {
    console.error("AI Recommendations Error:", err);
    // Always return a safe fallback response instead of throwing errors
    return res.json({ recommendations: [] });
  }
});

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