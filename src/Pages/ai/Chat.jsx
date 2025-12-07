import React, { useState, useRef, useEffect } from "react";
import apiClient from "../../services/api";
import "../../styles/AI.css";

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your BookHive AI assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date()
    };
    
    // Update messages state with user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage("");
    setLoading(true);
    
    try {
      // Call backend AI API using the correct format
      const response = await apiClient.post("/ai/chat", { message: inputMessage });
      
      // Add AI response to chat
      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.reply,
        sender: "ai",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      
      // Create a fallback error message
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm temporarily unavailable. Please try again in a moment.",
        sender: "ai",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resources-container">
      <div className="resources-header">
        <h1>🤖 AI Book Assistant</h1>
        <p>Chat with our AI assistant for book recommendations and platform help</p>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.sender}`}
            >
              <div className="message-content">
                <p>{message.text}</p>
                <span className="timestamp">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="message ai">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-form">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about books, genres, or platform features..."
            disabled={loading}
          />
          <button 
            type="submit" 
            className="send-button" 
            disabled={loading || !inputMessage.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;