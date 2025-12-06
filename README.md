# BookHive - Collaborative Learning Platform

BookHive is a comprehensive educational platform that enables users to share, discover, and collaborate on learning resources. Built with modern web technologies, it features a robust credit-based economy, AI-powered tagging, community features, and seamless user experience.

## 🌟 Key Features

### User Management
- Secure user registration and authentication
- Complete profile management with editing capabilities
- Avatar and bio customization
- Interest-based tagging with AI generation

### Credit & Tagging System
- **Credit Economy**: Earn credits for contributions, spend for downloads
- **AI-Powered Tags**: Automatic tag generation based on content
- **Leaderboard**: Rank users by contribution and engagement
- **Gamification**: Badges and achievements for active participation

### Resource Management
- **Multi-format Support**: Upload PDFs, notes, documents, videos, and audio
- **Premium Resources**: Mark resources as premium with custom pricing
- **Smart Organization**: Categorization and tagging for easy discovery
- **Credit-based Access**: Spend credits to download resources

### Community Features
- **Stories Platform**: Share learning experiences and insights
- **Study Circles**: Subject-based groups for collaborative learning
- **Discussion Threads**: Engage in topic-specific conversations
- **Social Engagement**: Like, comment, and follow other users

### Request & Feedback System
- **Resource Requests**: Request specific learning materials
- **User Feedback**: Collect suggestions and bug reports
- **Status Tracking**: Monitor request fulfillment progress

### Search & Discovery
- **Global Search**: Find resources and users across the platform
- **Smart Filtering**: Filter by category, type, and tags
- **NLP-Powered**: AI-enhanced search with natural language processing

## 🛠 Technology Stack

### Frontend
- **React** with Create React App
- **React Router** for navigation
- **Context API** for state management
- **Axios** for API communication
- **Responsive CSS** with mobile-first design

### Backend
- **Express.js** REST API
- **MongoDB** with Mongoose ODM
- **JWT Authentication** for secure access
- **OpenAI GPT-3.5** for AI features
- **Railway** for deployment

### DevOps
- **GitHub Pages** for frontend hosting
- **Railway** for backend deployment
- **MongoDB Atlas** for database hosting

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB database
- OpenAI API key (optional)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/himanshu5683/bookhive.git
   cd bookhive
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Configure environment variables:**
   - Create `.env` in root directory for frontend
   - Create `.env` in `backend` directory for backend

### Development

1. **Start backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start frontend development server:**
   ```bash
   npm start
   ```

3. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000)

### Production Build

1. **Build frontend:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   cd backend
   npm start
   ```

## 📁 Project Structure

```
bookhive/
├── public/                 # Static assets
├── src/                    # Frontend source code
│   ├── auth/              # Authentication context
│   ├── components/        # Reusable components
│   ├── Pages/             # Page components
│   │   └── common/        # Shared page components
│   ├── services/          # API clients
│   ├── styles/            # CSS stylesheets
│   └── utils/             # Utility functions
├── backend/               # Backend source code
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── db/                # Database configuration
│   └── middleware/        # Express middleware
├── DEPLOYMENT_GUIDE.md    # Deployment instructions
└── PROJECT_COMPLETION_SUMMARY.md  # Project documentation
```

## 🎯 Core Functionality

### User Profiles
- Automatic profile creation on signup
- Display uploaded resources, credit points, and tags
- Profile editing capabilities
- Interest-based tagging with AI

### Resource Sharing
- Authenticated file uploads (PDFs, notes, documents)
- Proper user reference storage in backend
- Premium resource marking with custom pricing
- Credit-based download system

### Credit System
- Activity-based credit assignment (uploads, stories, participation)
- AI/NLP tag generation for users and content
- Leaderboard ranking by credit points
- Real-time credit updates

### Community Features
- Story sharing with editing/deleting capabilities
- Study circles for collaborative learning
- Discussion threads with replies
- Request and feedback systems

## 🔧 Deployment

### Frontend (GitHub Pages)
1. Configure `REACT_APP_API_URL` environment variable
2. Build the application: `npm run build`
3. Deploy to GitHub Pages using GitHub Actions

### Backend (Railway)
1. Set environment variables in Railway dashboard
2. Connect to MongoDB Atlas database
3. Deploy using Railway CLI: `railway up`

### Environment Variables

**Frontend (.env):**
```env
REACT_APP_API_URL=https://your-backend-domain.up.railway.app/api
```

**Backend (.env):**
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=https://your-frontend-domain.com
OPENAI_API_KEY=your_openai_api_key
```

## 📖 Documentation

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [PROJECT_COMPLETION_SUMMARY.md](PROJECT_COMPLETION_SUMMARY.md) - Project overview and features
- [API Documentation](backend/routes/) - Backend API route documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Create React App
- Powered by Express.js and MongoDB
- AI features powered by OpenAI
- Hosted on GitHub Pages and Railway

## 📞 Support

For issues and feature requests, please create an issue on GitHub.