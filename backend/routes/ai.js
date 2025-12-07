const express = require("express");
const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ reply: "Please type a message." });
    }

    const reply = generateAIResponse(userMessage);

    return res.json({ reply });

  } catch (err) {
    console.error("AI Chat Error:", err);
    return res.json({ reply: "Something went wrong, try again!" });
  }
});

function generateAIResponse(message) {
  const m = message.toLowerCase();

  if (m.includes("hi") || m.includes("hello")) {
    return "Hi there! How can I help you today?";
  }
  if (m.includes("recommend")) {
    return "Tell me what genre you like and I'll suggest a book!";
  }
  if (m.includes("help")) {
    return "Sure! You can ask me about books, authors, genres, or BookHive features.";
  }

  return "I'm still learning, but I'll improve over time!";
}

module.exports = router;