// backend/services/inbuiltAI.js - Inbuilt AI Logic for BookHive Chatbot

/**
 * Generate inbuilt AI responses based on user messages
 * @param {string} message - User's message
 * @param {Array} history - Conversation history
 * @param {Object} user - User object (optional)
 * @returns {string} - Generated response
 */
const generateInbuiltAIResponse = (message, history = [], user = null) => {
  try {
    // Convert message to lowercase for easier matching
    const lowerMessage = message.toLowerCase().trim();
    
    // Keywords and phrases for different categories
    const greetingKeywords = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
    const helpKeywords = ['help', 'support', 'assistance', 'problem', 'issue', 'trouble', 'stuck'];
    const bookKeywords = ['book', 'books', 'novel', 'novels', 'literature', 'read', 'reading', 'recommend'];
    const searchKeywords = ['search', 'find', 'look for', 'looking for', 'where is', 'where can i find'];
    const uploadKeywords = ['upload', 'share', 'contribute', 'add resource', 'add book'];
    const downloadKeywords = ['download', 'get', 'access', 'obtain'];
    const profileKeywords = ['profile', 'account', 'settings', 'update profile', 'change settings'];
    const creditsKeywords = ['credit', 'credits', 'points', 'balance', 'earn', 'spend'];
    const categories = ['fiction', 'non-fiction', 'science', 'history', 'mathematics', 'programming', 'technology', 'art', 'music', 'biography'];
    
    // Check for greetings
    if (greetingKeywords.some(keyword => lowerMessage.includes(keyword))) {
      const userName = user && user.name ? user.name : 'there';
      const responses = [
        `Hello ${userName}! I'm your BookHive assistant. How can I help you find great books today?`,
        `Hi ${userName}! Welcome to BookHive. What kind of books are you interested in?`,
        `Greetings ${userName}! I'm here to help you discover amazing resources. What can I assist you with?`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Check for help requests
    if (helpKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return "I'm here to help! You can ask me about:\n• Finding books by title, author, or category\n• Uploading your own resources\n• Managing your profile\n• Understanding the credit system\n• Navigating BookHive features\n\nWhat specifically would you like assistance with?";
    }
    
    // Check for book recommendations/search
    if (bookKeywords.some(keyword => lowerMessage.includes(keyword)) || searchKeywords.some(keyword => lowerMessage.includes(keyword))) {
      // Extract potential category from message
      let foundCategory = null;
      for (const category of categories) {
        if (lowerMessage.includes(category)) {
          foundCategory = category;
          break;
        }
      }
      
      if (foundCategory) {
        return `I found some great ${foundCategory} resources for you! Here are some popular options in that category:
• Highly-rated ${foundCategory} books
• Recently added ${foundCategory} materials
• Community favorites in ${foundCategory}

Would you like me to show you some specific titles?`;
      } else {
        return "I'd be happy to help you find books! You can search by:\n• Title or author name\n• Category (fiction, science, history, etc.)\n• Tags or keywords\n\nWhat kind of books are you looking for?";
      }
    }
    
    // Check for upload requests
    if (uploadKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return "Contributing to BookHive is easy!\n1. Go to the 'Upload' section\n2. Choose your file (PDF, document, video, audio)\n3. Add a title, description, and category\n4. Set pricing (if applicable)\n5. Add tags for better discoverability\n6. Submit your resource\n\nYou'll earn credits for each download. Would you like tips on creating engaging resource descriptions?";
    }
    
    // Check for download/access requests
    if (downloadKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return "To download resources:\n1. Browse or search for what you need\n2. Click on any resource to view details\n3. Click the 'Download' button\n4. If it's a premium resource, you'll need sufficient credits\n\nRemember, you earn credits by uploading your own resources and participating in the community!";
    }
    
    // Check for profile/account requests
    if (profileKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return "Managing your profile:\n• Update your bio and interests in 'Profile Settings'\n• Track your contributions and downloads\n• View your credit balance\n• Manage your tags/interests\n• Enable two-factor authentication for security\n\nWould you like help with any specific profile feature?";
    }
    
    // Check for credits system questions
    if (creditsKeywords.some(keyword => lowerMessage.includes(keyword))) {
      const userCredits = user && user.credits !== undefined ? user.credits : 0;
      return `BookHive uses a credit system to encourage sharing:
• Earn credits by uploading resources (50-200 per upload)
• Earn credits by rating resources (5-10 per rating)
• Spend credits to download resources (typically 50 credits)

${user ? `You currently have ${userCredits} credits.` : 'Sign in to see your credit balance.'}

Would you like tips on earning more credits?`;
    }
    
    // Check for specific questions
    if (lowerMessage.includes('how') && lowerMessage.includes('work')) {
      return "BookHive works by connecting learners and educators:\n1. Users upload educational resources (notes, PDFs, videos)\n2. Community members download and rate resources\n3. Uploaders earn credits for their contributions\n4. Everyone benefits from shared knowledge\n\nThe more you contribute, the more you gain access to!";
    }
    
    if (lowerMessage.includes('benefit') || lowerMessage.includes('why') && (lowerMessage.includes('use') || lowerMessage.includes('join'))) {
      return "Benefits of BookHive:\n📚 Free access to thousands of educational resources\n💰 Earn credits by sharing your knowledge\n🌟 Build your reputation in the learning community\n🔍 Easy search and discovery of materials\n🛡️ Secure platform with user profiles\n\nJoin our community of lifelong learners today!";
    }
    
    // Default response with context awareness
    const lastUserMessage = history.filter(msg => msg.role === 'user').pop();
    const lastAIMessage = history.filter(msg => msg.role === 'assistant').pop();
    
    // If we're continuing a conversation
    if (lastAIMessage) {
      return "I'm continuing to help you with your BookHive experience. Could you clarify what specific information you're looking for? You can ask about finding books, uploading resources, managing your profile, or understanding how the platform works.";
    }
    
    // General fallback response
    const generalResponses = [
      "I'm your BookHive assistant! I can help you find books, upload resources, manage your profile, and understand how the platform works. What would you like to know?",
      "Welcome to BookHive! I'm here to help with any questions about finding educational resources, contributing to the community, or navigating the platform. How can I assist you today?",
      "As your BookHive guide, I can help with book recommendations, uploading resources, understanding credits, and more. What would you like to explore?"
    ];
    
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  } catch (error) {
    console.error('Inbuilt AI Error:', error);
    // Safe fallback response
    return "I'm here to help! You can ask me about finding books, uploading resources, or managing your profile. What would you like to know?";
  }
};

/**
 * Generate relevant tags for a resource based on its metadata
 * @param {string} title - Resource title
 * @param {string} description - Resource description
 * @param {string} category - Resource category
 * @param {string} type - Resource type
 * @returns {Array} - Array of generated tags
 */
const generateResourceTags = (title, description, category, type) => {
  try {
    // Combine all text for analysis
    const fullText = `${title} ${description} ${category} ${type}`.toLowerCase();
    
    // Define base tags from category and type
    const tags = [category.toLowerCase(), type.toLowerCase()];
    
    // Define keywords for different subjects
    const subjectKeywords = {
      'programming': ['code', 'coding', 'software', 'development', 'javascript', 'python', 'java', 'c++', 'algorithm', 'framework'],
      'science': ['biology', 'chemistry', 'physics', 'experiment', 'research', 'scientific', 'lab', 'theory'],
      'mathematics': ['algebra', 'calculus', 'geometry', 'statistics', 'equation', 'formula', 'theorem'],
      'technology': ['computer', 'digital', 'internet', 'ai', 'machine learning', 'robotics', 'innovation'],
      'history': ['historical', 'ancient', 'medieval', 'modern', 'civilization', 'war', 'revolution'],
      'business': ['management', 'marketing', 'finance', 'entrepreneur', 'startup', 'corporate', 'economy'],
      'arts': ['painting', 'sculpture', 'design', 'creative', 'visual', 'performing'],
      'languages': ['english', 'spanish', 'french', 'german', 'chinese', 'japanese', 'grammar', 'vocabulary']
    };
    
    // Add subject-specific tags based on category
    if (subjectKeywords[category.toLowerCase()]) {
      subjectKeywords[category.toLowerCase()].forEach(keyword => {
        if (fullText.includes(keyword)) {
          tags.push(keyword);
        }
      });
    }
    
    // Add general educational tags
    const generalKeywords = ['education', 'learning', 'study', 'academic', 'tutorial', 'guide', 'introduction', 'advanced'];
    generalKeywords.forEach(keyword => {
      if (fullText.includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    // Add level tags based on content
    if (fullText.includes('beginner') || fullText.includes('intro') || fullText.includes('basic')) {
      tags.push('beginner');
    }
    if (fullText.includes('intermediate')) {
      tags.push('intermediate');
    }
    if (fullText.includes('advanced') || fullText.includes('expert')) {
      tags.push('advanced');
    }
    
    // Remove duplicates and limit to 10 tags
    const uniqueTags = [...new Set(tags)];
    return uniqueTags.slice(0, 10);
  } catch (error) {
    console.error('Error generating resource tags:', error);
    // Return basic tags as fallback
    return [category.toLowerCase(), type.toLowerCase()];
  }
};

export default {
  generateInbuiltAIResponse,
  generateResourceTags
};