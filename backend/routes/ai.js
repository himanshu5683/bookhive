const express = require("express");
const router = express.Router();
const { generateInbuiltAIResponse } = require("../services/inbuiltAI");

// Store conversation history in memory (in production, you might want to use a database)
const conversationHistories = new Map();

router.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const userId = req.body.userId || "anonymous"; // Use userId if provided, otherwise anonymous
    const user = req.body.user || null; // User object if provided

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

    // Generate AI response using inbuilt rule-based logic
    const reply = generateInbuiltAIResponse(userMessage, history, user);

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
    return res.json({ reply: "Something went wrong, try again!" });
  }
});

module.exports = router;