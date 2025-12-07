const express = require("express");
const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    const userMessage = req.body.prompt;

    if (!userMessage) {
      return res.status(400).json({ reply: "Please type a message." });
    }

    // Ensure we always have a response
    let reply;
    try {
      reply = generateAIResponse(userMessage);
    } catch (err) {
      console.error("AI Logic Error:", err);
      reply = "I am here to help! How can I assist you?";
    }

    return res.json({ reply });

  } catch (err) {
    console.error("AI Chat Error:", err);
    return res.status(500).json({ reply: "I am here to help! How can I assist you?" });
  }
});

function generateAIResponse(message) {
  try {
    const m = message.toLowerCase().trim();

    if (m.includes("hi") || m.includes("hello") || m.includes("hey")) {
      return "Hi there! How can I help you today?";
    }
    if (m.includes("recommend")) {
      return "Tell me what genre you like and I'll suggest a book!";
    }
    if (m.includes("help")) {
      return "Sure! You can ask me about books, authors, genres, or BookHive features.";
    }
    if (m.includes("thank")) {
      return "You're welcome! Is there anything else I can help with?";
    }
    if (m.includes("bye") || m.includes("goodbye")) {
      return "Goodbye! Feel free to chat again anytime.";
    }

    return "I'm still learning, but I'll improve over time!";
  } catch (error) {
    console.error("Error in generateAIResponse:", error);
    // This will be caught by the outer try-catch and fallback will be used
    throw error;
  }
}

module.exports = router;