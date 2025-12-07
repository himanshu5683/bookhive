# Railway Deployment Guide for BookHive

## Prerequisites
- Railway account (https://railway.app)
- Git installed
- This repository cloned locally

## Deployment Steps

### 1. Frontend Deployment

1. Navigate to your Railway dashboard
2. Click "New Project" → "Deploy from GitHub"
3. Select this repository
4. Railway will automatically detect the frontend (root directory) and backend (backend directory)
5. For the frontend:
   - Build command: `npm run build`
   - Start command: `npx serve -s build`
   - Node version: 18.17.0 (specified in .node-version and .nvmrc)

### 2. Backend Deployment

1. In Railway, create a new service for the backend
2. Set the root directory to `/backend`
3. Start command: `node server.js`
4. Node version: 18.17.0
5. Add environment variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Your JWT secret
   - `OPENAI_API_KEY` - Your OpenAI API key (if using OpenAI features)

### 3. Environment Variables

#### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend-service.up.railway.app/api
REACT_APP_WS_URL=wss://your-backend-service.up.railway.app
REACT_APP_URL=https://your-frontend-service.up.railway.app
```

#### Backend (.env)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

### 4. Domain Configuration

1. Add custom domains in Railway settings for both frontend and backend
2. Update CORS origins in backend to allow your frontend domain
3. Update the frontend environment variables to point to your backend domain

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Ensure Node version is set to 18.17.0
   - Check that all dependencies are compatible
   - Clear build cache in Railway if needed

2. **Runtime Errors**
   - Verify all environment variables are set
   - Check MongoDB connection
   - Ensure CORS is properly configured

3. **Performance Issues**
   - Monitor resource usage in Railway dashboard
   - Optimize database queries
   - Consider adding caching mechanisms

## Support

For additional help, refer to:
- Railway Documentation: https://docs.railway.app
- BookHive Documentation: See other markdown files in this repository