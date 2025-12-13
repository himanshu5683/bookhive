# Railway Setup Instructions for BookHive Monorepo

## Current Issue
The backend service is not properly deployed on Railway, resulting in "Application not found" errors when trying to access the API endpoints. This is causing the network errors in login/signup functionality.

## Solution: Proper Monorepo Setup on Railway

Since you have a monorepo structure (frontend in root, backend in `/backend`), you need to set up two separate services on Railway:

### 1. Frontend Service Setup
1. Go to your Railway project dashboard
2. Click on "New Service" → "Deploy from GitHub"
3. Select your BookHive repository
4. Railway should automatically detect the frontend (root directory)
5. For the frontend service:
   - Build command: `npm run build`
   - Start command: `npx serve -s build`
   - Node version: 20.8.0 (as specified in your configs)

### 2. Backend Service Setup
1. In the same Railway project, click "New Service" → "Deploy from GitHub" again
2. Select your BookHive repository
3. Set the root directory to `/backend`
4. For the backend service:
   - Build command: `npm ci --omit=dev`
   - Start command: `npm start`
   - Node version: 20.8.0

### 3. Environment Variables Setup

#### Frontend Environment Variables
Set these in the frontend service:
```
REACT_APP_API_URL=https://YOUR-BACKEND-SERVICE-ID.up.railway.app/api
REACT_APP_WS_URL=wss://YOUR-BACKEND-SERVICE-ID.up.railway.app
```

#### Backend Environment Variables
Set these in the backend service:
```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_jwt_secret
SESSION_SECRET=your_strong_session_secret
FRONTEND_URL=https://himanshu5683.github.io
PRODUCTION_URL=https://himanshu5683.github.io
REACT_APP_URL=https://himanshu5683.github.io
```

### 4. Update Frontend Configuration

After setting up the backend service, update your frontend `.env.production` file with the correct backend URL:

```env
# BookHive Frontend Production Configuration

# Backend API URL - UPDATE THIS WITH YOUR ACTUAL BACKEND SERVICE URL
REACT_APP_API_URL=https://YOUR-BACKEND-SERVICE-ID.up.railway.app/api

# WebSocket URL - UPDATE THIS WITH YOUR ACTUAL BACKEND SERVICE URL
REACT_APP_WS_URL=wss://YOUR-BACKEND-SERVICE-ID.up.railway.app

# Frontend URL (for OAuth callbacks)
REACT_APP_URL=https://himanshu5683.github.io/bookhive
```

### 5. Redeploy Both Services

1. After making these changes, redeploy both services
2. Monitor the deployment logs to ensure both services start successfully
3. Test the health endpoint: `https://YOUR-BACKEND-SERVICE-ID.up.railway.app/api/health`

### 6. Verify MongoDB Connection

Ensure your MongoDB Atlas cluster has the correct IP whitelist for Railway:
- Add `0.0.0.0/0` to allow all IPs (less secure but ensures connectivity)
- Or add Railway's specific IP ranges if known

## Troubleshooting

If you're still having issues:

1. Check Railway logs for both services
2. Verify all environment variables are set correctly
3. Ensure the backend service is actually running (not crashed)
4. Test the backend health endpoint directly in browser
5. Check that the MongoDB connection string is correct and the database is accessible

## Alternative Approach: Single Service with Subdirectories

If you prefer to keep everything in one service, you can:

1. Modify your root `railway.json` to handle both frontend and backend
2. Use a custom start command that serves the frontend and starts the backend API
3. This approach is more complex and not recommended for beginners

The dual-service approach described above is the recommended solution for monorepo setups on Railway.