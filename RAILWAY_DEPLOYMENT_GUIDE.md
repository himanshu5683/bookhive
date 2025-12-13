# Railway Deployment Guide for BookHive Backend

This guide will help you deploy your BookHive backend to Railway successfully.

## Prerequisites

1. A Railway account (railway.app)
2. Your MongoDB Atlas database configured and accessible
3. All environment variables properly set up

## Deployment Steps

### 1. Prepare Your Project

Ensure your backend directory has all necessary files:
- `package.json` with start script
- `railway.json` configuration
- Environment variables in `.env.production`

### 2. Deploy to Railway Using Git

1. Push your code to a GitHub repository
2. Go to Railway.app and create a new project
3. Connect your GitHub repository
4. Select your repository and branch
5. Railway will automatically detect it's a Node.js project

### 3. Configure Environment Variables

In Railway, go to your project > Settings > Environment Variables and add:

```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_jwt_secret
SESSION_SECRET=your_strong_session_secret
REACT_APP_URL=https://himanshu5683.github.io/bookhive
PRODUCTION_URL=https://himanshu5683.github.io/bookhive
FRONTEND_URL=https://himanshu5683.github.io/bookhive
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
GOOGLE_CALLBACK_URL=https://your-railway-app-url.up.railway.app/api/oauth/google/callback
GITHUB_CALLBACK_URL=https://your-railway-app-url.up.railway.app/api/oauth/github/callback
FACEBOOK_CALLBACK_URL=https://your-railway-app-url.up.railway.app/api/oauth/facebook/callback
TWITTER_CALLBACK_URL=https://your-railway-app-url.up.railway.app/api/oauth/twitter/callback
```

### 4. Configure Custom Domain (Optional)

If you want to use a custom domain:
1. Go to Settings > Domains
2. Add your custom domain
3. Update your environment variables accordingly

### 5. Verify Deployment

1. Check the logs in Railway to ensure the app started successfully
2. Visit your app's URL + `/api/health` to verify it's running
3. Test authentication endpoints

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure MONGODB_URI is correctly set
   - Check MongoDB Atlas IP whitelist includes Railway's IPs

2. **CORS Errors**
   - Verify FRONTEND_URL includes your frontend domain
   - Check that CORS is properly configured in server.js

3. **Environment Variables Not Set**
   - Double-check all required environment variables are set in Railway

### Health Check

Visit: `https://your-app-url.up.railway.app/api/health`

Expected response:
```json
{
  "status": "ok",
  "db": "connected",
  "timestamp": "ISO_TIMESTAMP",
  "message": "BookHive Backend is running successfully"
}
```

## Notes

- Railway automatically sets the PORT environment variable
- The application will automatically use the production MongoDB URI
- All OAuth callbacks should point to your Railway deployment URL
- Make sure your MongoDB Atlas cluster allows connections from Railway IPs