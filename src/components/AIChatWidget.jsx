import React, { useState, useContext, useRef, useEffect } from "react";
import AuthContext from "../auth/AuthContext";
import apiClient from "../services/api";
import "../styles/AI.css";

const AIChatWidget = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
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
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);
    
    try {
      // Get AI response
      const response = await apiClient.aiAPI.chat({
        message: inputMessage,
        userId: user?.id
      });
      
      // Add AI response to chat
      const aiMessage = {
        id: Date.now() + 1,
        text: response.response,
        sender: "ai",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error. Please try again.",
        sender: "ai",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-widget">
      {isOpen ? (
        <div className="chat-widget-expanded card">
          <div className="chat-widget-header">
            <h3>🤖 BookHive AI Assistant</h3>
            <button 
              className="chat-widget-close btn btn-icon btn-ghost"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
          
          <div className="chat-widget-messages">
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
          
          <form onSubmit={handleSendMessage} className="chat-widget-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about books, genres, or platform features..."
              disabled={loading}
              autoFocus
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || !inputMessage.trim()}
            >
              Send
            </button>
          </form>
        </div>
      ) : (
        <button 
          className="chat-widget-toggle btn btn-primary"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI chat"
        >
          <span className="ai-icon">🤖</span>
          <span className="ai-text">AI Assistant</span>
        </button>
      )}
    </div>
  );
};

export default AIChatWidget;