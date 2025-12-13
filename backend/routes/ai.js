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