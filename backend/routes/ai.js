const express = require("express");
const { OpenAI } = require('openai');
require('dotenv').config();

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use /chat endpoint to match frontend expectations
router.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ reply: "Please type a message." });
    }

    // Ensure we always have a response
    let reply;
    try {
      // Call OpenAI API to generate a response
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant for a book recommendation platform called BookHive. Help users find books, recommend titles based on genres, and assist with platform features. Keep responses concise and friendly."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      reply = completion.choices[0].message.content.trim();
    } catch (err) {
      console.error("OpenAI API Error:", err);
      reply = "I am here to help! How can I assist you?";
    }

    return res.json({ reply });

  } catch (err) {
    console.error("AI Chat Error:", err);
    return res.status(500).json({ reply: "I am here to help! How can I assist you?" });
  }
});

module.exports = router;