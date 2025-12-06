# BookHive - Full-Stack Library Platform

## Project Overview

BookHive is a comprehensive online library and knowledge-sharing platform featuring:
- **Resource Library**: Share and discover notes, PDFs, and learning materials
- **Story Sharing**: Microblog-style story sharing for personal achievements
- **Study Circles**: Joinable study groups with discussion threads
- **Leaderboard**: User rankings with gamification and achievements
- **User Profiles**: Personal profiles with credit tracking and contributions
- **Credit System**: Earn credits for uploads, ratings, and community engagement
- **Light/Dark Theme**: Full theme support with user preferences

## Technology Stack

### Frontend
- **React 19.2.0**: UI framework
- **React Router DOM 7.9.6**: Client-side routing
- **CSS Variables**: Dual-theme system (light/dark)
- **Context API**: Global state management (Auth, Credits, Theme)

### Backend
- **Express.js 4.18.2**: REST API server
- **Node.js**: Runtime
- **Mongoose 8.0.0**: MongoDB ODM
- **Firebase Admin SDK**: Alternative database option
- **JWT (jsonwebtoken 9.1.2)**: Authentication
- **bcryptjs 2.4.3**: Password hashing
- **express-validator 7.0.0**: Input validation
- **CORS**: Cross-origin requests

## Project Structure

```
bookhive/
├── src/
│   ├── components/
│   │   ├── Navbar.js (with ThemeToggle)
│   │   ├── Home.js
│   │   ├── Library.js
│   │   ├── Profile.js
│   │   ├── Upload.js
│   │   ├── BookCard.js
│   │   ├── ResourceCard.js
│   │   ├── Loading.js
│   │   ├── Footer.js
│   │   └── ThemeToggle.jsx
│   ├── pages/
│   │   ├── Resources.jsx
│   │   ├── Stories.jsx
│   │   ├── StudyCircles.jsx
│   │   ├── Leaderboard.jsx
│   │   └── UserProfile.jsx
│   ├── context/
│   │   ├── AuthContext.js
│   │   ├── CreditContext.jsx
│   │   └── ThemeContext.jsx
│   ├── services/
│   │   └── api.js (NEW: API client utility)
│   ├── data/
│   │   └── sampleData.js
│   ├── styles/
│   │   ├── styles.css (with theme variables)
│   │   ├── Home.css
│   │   ├── Resources.css
│   │   ├── Stories.css
│   │   ├── StudyCircles.css
│   │   ├── Leaderboard.css
│   │   ├── UserProfile.css
│   │   ├── ResourceCard.css
│   │   └── ThemeToggle.css
│   ├── App.js
│   └── index.js
├── backend/
│   ├── server.js (Express server)
│   ├── package.json
│   ├── .env.example
│   ├── db/
│   │   └── database.js (MongoDB & Firebase connection)
│   └── routes/
│       ├── auth.js (signup, login, logout, verify)
│       ├── resources.js (CRUD, download tracking)
│       ├── stories.js (create, like, comment, delete)
│       ├── circles.js (NEW: join, create thread, reply)
│       └── users.js (NEW: profile, leaderboard, credits)
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/verify` - Verify token

### Resources (Notes/PDFs)
- `GET /api/resources?type=note&category=programming&sort=recent` - List resources
- `GET /api/resources/:id` - Get resource details
- `POST /api/resources` - Upload new resource
- `PUT /api/resources/:id` - Update resource metadata
- `DELETE /api/resources/:id` - Delete resource
- `POST /api/resources/:id/download` - Track download & deduct credits
- `POST /api/resources/:id/rate` - Rate resource

### Stories
- `GET /api/stories?page=1&limit=50` - Get story feed (paginated)
- `POST /api/stories` - Create story
- `POST /api/stories/:id/like` - Like story
- `DELETE /api/stories/:id/like` - Unlike story
- `POST /api/stories/:id/comment` - Comment on story
- `DELETE /api/stories/:id` - Delete story

### Study Circles
- `GET /api/circles?topic=programming` - List circles
- `GET /api/circles/:id` - Get circle details
- `POST /api/circles` - Create new circle
- `POST /api/circles/:id/join` - Join circle
- `POST /api/circles/:id/thread` - Create discussion thread
- `POST /api/circles/:id/thread/:threadId/reply` - Reply to thread

### Users
- `GET /api/users?page=1&limit=10` - List users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/leaderboard?sortBy=credits` - Get leaderboard
- `PUT /api/users/:id` - Update profile (name, bio, avatar)
- `PUT /api/users/:id/credits` - Update credits (admin only)
- `GET /api/users/:id/achievements` - Get user badges
- `POST /api/users/:id/follow` - Follow user

## React API Client Usage

The `src/services/api.js` file provides a clean API client:

```javascript
import { resourcesAPI, storiesAPI, usersAPI, circlesAPI } from '../services/api';

// Get resources with filters
const resources = await resourcesAPI.getAll({ type: 'pdf', category: 'programming' });

// Create a story
const story = await storiesAPI.create({ content: 'My learning journey...' });

// Like a story
await storiesAPI.like(storyId);

// Get leaderboard
const leaderboard = await usersAPI.getLeaderboard({ sortBy: 'credits' });

// Join study circle
await circlesAPI.join(circleId);
```

## Current Implementation Status

### ✅ Completed
- Full React frontend with 5 new pages (Resources, Stories, StudyCircles, Leaderboard, UserProfile)
- Light/Dark theme system with CSS variables and context
- Sample data for all features
- Credit scoring context (frontend)
- ResourceCard component with ratings
- Responsive design across all pages
- Backend Express server scaffold
- All API route scaffolds (auth, resources, stories, circles, users)
- React API client utility with all endpoints
- API integration hooks in React pages (with fallback to sample data)
- Database connection samples (MongoDB & Firebase)
- Environment configuration template

### 🔧 In Development
- Backend credit scoring logic
- Authentication implementation with JWT
- File upload functionality
- Database connection testing

### ⏳ Pending
- API documentation/Swagger
- Full end-to-end testing
- Deployment configuration

## Setting Up the Backend

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/bookhive
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:3000
```

### 3. Choose Database
Option A: MongoDB with Mongoose
```javascript
// In backend/server.js
const { connectMongoDB } = require('./db/database');
connectMongoDB();
```

Option B: Firebase
```javascript
// In backend/server.js
const { connectFirebase } = require('./db/database');
connectFirebase();
```

### 4. Start Backend Server
```bash
npm run dev  # With watch mode (requires nodemon)
# or
npm start    # Production mode
```

Server runs on http://localhost:5000

## Setting Up the Frontend

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API URL
Create `.env` in root directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm start
```

App runs on http://localhost:3000

## Theme System

The platform supports light (default) and dark themes:

### CSS Variables (src/styles/styles.css)
```css
:root {
  /* Light theme */
  --bh-primary: #0f172a;
  --bh-bg: #ffffff;
  --bh-surface: #f6f8fb;
}

body.dark-theme {
  /* Dark theme */
  --bh-primary: #f0f5ff;
  --bh-bg: #1a2542;
  --bh-surface: #0f172a;
}
```

### Using Theme in Components
```javascript
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {isDarkMode ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
```

## Credit System

Users earn credits through various activities:
- **Uploads**: 50-200 credits per resource
- **Ratings**: 5-10 credits per rating given
- **Community**: 10-50 credits for helpful responses
- **Downloads**: Users spend credits to download resources

### Using Credit Context
```javascript
import { useCredits } from '../context/CreditContext';

function ResourceDownload() {
  const { getCredits, deductCredits } = useCredits();
  
  const download = async (resourceId) => {
    const credits = getCredits(userId);
    if (credits >= 50) {
      deductCredits(userId, 50);
      // Download resource...
    }
  };
}
```

## Sample Data

The platform includes realistic sample data in `src/data/sampleData.js`:
- **5 Users**: With profiles, credits, and contributions
- **5 Notes + 4 PDFs**: Various programming and learning resources
- **5 Stories**: User engagement examples
- **4 Study Circles**: Different subject areas
- **6 Badge Types**: Achievements for gamification

## Next Steps

### Phase 1: Backend Implementation
1. **Implement Authentication**
   - Hash passwords with bcryptjs
   - Generate JWT tokens
   - Verify tokens on protected routes
   
2. **Connect to Database**
   - Test MongoDB/Firebase connection
   - Implement user schema
   - Implement resource schema
   
3. **Complete Route Handlers**
   - Implement actual database operations
   - Add error handling
   - Add validation

### Phase 2: Backend Features
1. **Credit Scoring**
   - Award credits on upload
   - Deduct credits on download
   - Track credit history
   
2. **File Uploads**
   - Configure file storage (local or cloud)
   - Validate file types
   - Implement download tracking

### Phase 3: Frontend Integration
1. **Connect React Components**
   - Replace sample data with API calls
   - Handle loading/error states
   - Implement user authentication flow

2. **User Experience**
   - Add toast notifications
   - Implement error boundaries
   - Add loading skeletons

## Testing

Sample data can be used for testing without a backend:
- Components currently fall back to `sampleData.js`
- All API calls are wrapped in try-catch with fallbacks
- Frontend is fully functional without backend connection

## File Upload Configuration

When implementing file uploads:

```javascript
// In resources.js route handler
const multer = require('multer');
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/', upload.single('file'), (req, res) => {
  // Save file metadata to database
  // Deduct/award credits
});
```

## Performance Tips

1. **Pagination**: All GET requests support pagination (page, limit)
2. **Filtering**: Use query parameters for efficient filtering
3. **Caching**: Implement client-side caching with localStorage
4. **Lazy Loading**: Images and resources load on demand

## Troubleshooting

### Backend won't start
- Check PORT is not in use: `netstat -ano | findstr :5000`
- Verify Node.js version: `node -v` (v14+)
- Install dependencies: `npm install`

### Frontend can't connect to API
- Verify backend is running on port 5000
- Check CORS configuration in `backend/server.js`
- Verify `REACT_APP_API_URL` in `.env`

### Database connection fails
- Verify MongoDB is running (if using MongoDB)
- Check connection string in `.env`
- Verify Firebase credentials (if using Firebase)

## Contributing

This is a template project. To extend:
1. Add new routes in `backend/routes/`
2. Create new pages in `src/pages/`
3. Add new contexts in `src/context/`
4. Update API client in `src/services/api.js`

## License

MIT

---

**Last Updated**: 2024
**Status**: Production-Ready Frontend + Backend Scaffold
