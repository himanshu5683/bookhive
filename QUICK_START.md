# BookHive Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js v14+ and npm
- Git

### Frontend Setup

```bash
# 1. Install frontend dependencies
npm install

# 2. Start development server
npm start

# Frontend runs on http://localhost:3000
```

The frontend **works immediately** with sample data - no backend required for testing!

### Backend Setup (Optional)

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env

# 4. Configure .env with your values
# Edit .env and set:
# - MONGODB_URI=mongodb://localhost:27017/bookhive
# - JWT_SECRET=your_secret_key

# 5. Start backend server
npm run dev

# Backend runs on http://localhost:5000
```

### Configure Frontend for Backend

If running backend, create `.env` in root:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Then restart frontend (`npm start`).

---

## 📚 Project Features

### Pages
- **Home**: Landing page with featured resources, stories, circles
- **Resources**: Searchable library of notes and PDFs
- **Stories**: Microblog-style story sharing
- **Study Circles**: Joinable discussion groups
- **Leaderboard**: User rankings and achievements
- **User Profile**: Individual user profiles with contribution history
- **Library**: Save and manage personal resource library
- **Upload**: Share new resources with the community

### Key Features
✅ Dark/Light theme toggle (saved to localStorage)
✅ Search and filter resources by type, category, rating
✅ User credit system (earn/spend credits)
✅ Story engagement (like, comment, share)
✅ Study group discussions
✅ User profiles with statistics
✅ Responsive design (mobile, tablet, desktop)

---

## 🔌 API Integration Status

### Currently Working
- Sample data loads immediately
- All pages display correctly
- Full UI/UX is functional
- Theme system works perfectly

### Next Steps to Enable Backend
1. Uncomment `TODO` API calls in React pages:
   - `Resources.jsx` - `resourcesAPI.getAll()`
   - `Stories.jsx` - `storiesAPI.getAll()`
   - `StudyCircles.jsx` - `circlesAPI.getAll()`
   - `Leaderboard.jsx` - `usersAPI.getLeaderboard()`
   - `UserProfile.jsx` - `usersAPI.getById()`

2. Example (in Resources.jsx):
```javascript
// Before: Using sample data
const resources = [
  ...sampleNotes.map(n => ({ ...n, type: 'note' })),
  ...samplePDFs.map(p => ({ ...p, type: 'pdf' })),
];

// After: Using API
const data = await resourcesAPI.getAll({ sortBy });
setAllResources(data.resources);
```

---

## 📁 Important Files to Know

### Frontend
| File | Purpose |
|------|---------|
| `src/App.js` | Main app with routing |
| `src/services/api.js` | API client utility |
| `src/context/` | Global state (Auth, Credits, Theme) |
| `src/pages/` | Feature pages |
| `src/components/` | Reusable components |
| `src/styles/styles.css` | Theme variables (light/dark) |

### Backend
| File | Purpose |
|------|---------|
| `backend/server.js` | Express server entry |
| `backend/routes/` | API endpoint handlers |
| `backend/db/database.js` | Database connections |
| `backend/.env.example` | Configuration template |

---

## 🎨 Theme System

The app includes a full light/dark mode system:

### Switching Themes
- Click theme toggle in navbar (☀️/🌙)
- Preference saved to localStorage
- Respects system preference on first visit

### CSS Variables
All colors defined in `src/styles/styles.css`:
```css
:root {
  --bh-primary: #0f172a;      /* Text color */
  --bh-bg: #ffffff;           /* Main background */
  --bh-surface: #f6f8fb;      /* Card background */
  --bh-accent: #3b82f6;       /* Buttons & links */
  /* ... more variables ... */
}

body.dark-theme {
  --bh-primary: #f0f5ff;      /* Light text */
  --bh-bg: #1a2542;           /* Dark background */
  --bh-surface: #0f172a;      /* Darker cards */
  /* ... overrides ... */
}
```

---

## 💰 Credit System

Users earn/spend credits for platform activities:

### Earning Credits
- Upload resource: 50-200 credits
- Rate resource: 5-10 credits
- Help community: 10-50 credits

### Spending Credits
- Download resource: 50 credits

### Implementation
```javascript
import { useCredits } from '../context/CreditContext';

const { addCredits, deductCredits, getCredits } = useCredits();

// Add credits for uploading
addCredits(userId, 100);

// Deduct credits for downloading
deductCredits(userId, 50);

// Check balance
const balance = getCredits(userId);
```

---

## 🧪 Testing & Development

### Sample Data
All realistic sample data in `src/data/sampleData.js`:
- 5 Users with profiles & stats
- 5 Notes + 4 PDFs
- 5 Stories
- 4 Study Circles
- 6 Achievement Badges

### Test Without Backend
Frontend works fully with sample data:
1. Start: `npm start`
2. Browse all pages
3. Test theme switching
4. Test search/filter
5. Try interactions (like, comment, join, etc.)

### Test With Backend
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm start`
3. Verify API calls in browser console
4. Check backend console for requests

---

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9  # Mac/Linux
# or
netstat -ano | findstr :5000   # Windows
taskkill /PID <PID> /F         # Windows
```

### Theme Not Persisting
- Check localStorage is enabled
- In DevTools: Application > Storage > Local Storage

### API Calls Not Working
- Verify `REACT_APP_API_URL` in `.env`
- Check backend is running on port 5000
- Check CORS is enabled in `backend/server.js`

### Sample Data Not Showing
- Verify `src/data/sampleData.js` exists
- Check console for errors
- Refresh page (Ctrl+Shift+R)

---

## 📖 API Usage Examples

### Get All Resources
```javascript
import { resourcesAPI } from '../services/api';

const resources = await resourcesAPI.getAll({
  type: 'pdf',
  category: 'programming',
  limit: 20
});
```

### Create Story
```javascript
import { storiesAPI } from '../services/api';

const story = await storiesAPI.create({
  content: 'Great learning experience!',
  emoji: '✨'
});
```

### Get Leaderboard
```javascript
import { usersAPI } from '../services/api';

const leaderboard = await usersAPI.getLeaderboard({
  sortBy: 'credits',
  page: 1,
  limit: 50
});
```

---

## 🚢 Deployment Checklist

### Frontend (Netlify/Vercel)
- [ ] `npm run build` creates optimized build
- [ ] Set `REACT_APP_API_URL` environment variable
- [ ] Deploy `build/` folder

### Backend (Heroku/Railway/Render)
- [ ] Set all environment variables (.env)
- [ ] Ensure MongoDB/Firebase is accessible
- [ ] Run `npm install` and `npm start`
- [ ] Update CORS_ORIGIN to production domain

---

## 📚 Learning Resources

### For Understanding the Code
- React Hooks: useState, useEffect, useContext
- Context API: Global state without Redux
- CSS Variables: Dynamic theming
- REST API: Standard HTTP methods
- Express.js: Routing and middleware

### For Extending the Project
1. **Add new page**: Create file in `src/pages/`
2. **Add new API route**: Create file in `backend/routes/`
3. **Add new context**: Create file in `src/context/`
4. **Update navigation**: Modify `src/components/Navbar.js`

---

## 💡 Pro Tips

1. **Use Sample Data for Testing**: Don't need backend for UI/UX testing
2. **LocalStorage Persistence**: Theme and saved books persist across sessions
3. **CSS Variables**: Change theme colors in one place
4. **API Fallback**: Frontend automatically falls back to sample data if API fails
5. **Loading States**: All pages have loading indicators

---

## 🤝 Getting Help

### Check Documentation
- Frontend: See `README.md` and `API_INTEGRATION_GUIDE.md`
- Backend: Check `backend/` for route comments
- Sample Data: Review `src/data/sampleData.js`

### Debug in Browser
- DevTools: Open with F12
- Console: Check for errors/warnings
- Network: View API calls
- Storage: Inspect localStorage/sessionStorage

---

## 🎯 Next Steps

1. **Explore the UI**: Navigate all pages, test features
2. **Review Code**: Understand component structure
3. **Connect Backend** (optional): Uncomment API calls
4. **Extend Features**: Add new pages/features
5. **Deploy**: Push to production

---

**Happy Coding! 🚀**
