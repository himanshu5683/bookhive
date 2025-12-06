# BookHive Deployment Guide

This guide provides step-by-step instructions for deploying the BookHive application with both frontend and backend components.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Frontend Deployment (GitHub Pages)](#frontend-deployment-github-pages)
3. [Backend Deployment (Railway)](#backend-deployment-railway)
4. [Environment Configuration](#environment-configuration)
5. [WebSocket Configuration](#websocket-configuration)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deployment, ensure you have:

1. **Node.js** (v14 or higher)
2. **npm** or **yarn**
3. **Git**
4. **MongoDB** database (MongoDB Atlas recommended for production)
5. **OpenAI API key** (optional, for AI features)
6. **GitHub account** (for frontend deployment)
7. **Railway account** (for backend deployment)

## Frontend Deployment (GitHub Pages)

### 1. Prepare the Frontend

```bash
# Navigate to the project root
cd bookhive

# Install dependencies
npm install

# Build the application
npm run build
```

### 2. Configure GitHub Pages

1. Create a new repository on GitHub (e.g., `bookhive-frontend`)
2. Add the remote origin:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/bookhive-frontend.git
   git push -u origin main
   ```

### 3. Deploy to GitHub Pages

Option 1: Using GitHub Actions (Recommended)
- The repository already includes a workflow in `.github/workflows/deploy.yml`

Option 2: Manual Deployment
```bash
# Install gh-pages
npm install gh-pages --save-dev

# Add deployment scripts to package.json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}

# Deploy
npm run deploy
```

### 4. Configure Custom Domain (Optional)
1. Go to Repository Settings → Pages
2. Add your custom domain
3. Update DNS records as instructed

## Backend Deployment (Railway)

### 1. Prepare the Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com

# OpenAI API (Optional)
OPENAI_API_KEY=your_openai_api_key

# WebSocket Configuration
WS_PORT=5000
```

### 3. Deploy to Railway

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Create a new project:
   ```bash
   railway init
   ```

4. Link to existing project (if applicable):
   ```bash
   railway link
   ```

5. Deploy:
   ```bash
   railway up
   ```

### 4. Configure MongoDB

1. Create a MongoDB Atlas cluster
2. Whitelist Railway's IP addresses
3. Create a database user
4. Update `MONGODB_URI` in Railway environment variables

### 5. Configure Environment Variables in Railway

Set the following environment variables in Railway:

- `PORT`: 5000
- `NODE_ENV`: production
- `MONGODB_URI`: your MongoDB connection string
- `JWT_SECRET`: your secret key
- `CORS_ORIGIN`: https://your-frontend-domain.com
- `OPENAI_API_KEY`: your OpenAI API key (optional)

## Environment Configuration

### Frontend Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
REACT_APP_API_URL=https://your-backend-domain.up.railway.app/api
REACT_APP_WS_URL=wss://your-backend-domain.up.railway.app

# Optional Features
REACT_APP_OPENAI_API_KEY=your_openai_api_key
```

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookhive

# Security
JWT_SECRET=supersecretkey123

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# AI Features
OPENAI_API_KEY=sk-your-openai-api-key

# WebSocket Configuration
WS_PORT=5000
```

## WebSocket Configuration

BookHive uses WebSockets for real-time updates. When deploying:

1. **Ensure WebSocket ports are open** - The WebSocket server runs on the same port as the HTTP server
2. **Configure reverse proxy** - If using a reverse proxy, ensure it supports WebSocket upgrades
3. **Update frontend configuration** - Make sure `REACT_APP_WS_URL` points to the correct WebSocket endpoint

For Railway deployment, WebSockets should work automatically as the platform supports WebSocket connections.

Testing WebSocket connectivity:
```bash
# Test WebSocket connection (requires wscat)
npm install -g wscat
wscat -c wss://your-backend-domain.up.railway.app/ws
```

## Post-Deployment Verification

### 1. Test API Endpoints

```bash
# Test health endpoint
curl https://your-backend-domain.up.railway.app/api/health

# Test authentication
curl -X POST https://your-backend-domain.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### 2. Test Frontend

1. Visit your deployed frontend URL
2. Try signing up/in
3. Test uploading a resource
4. Verify search functionality
5. Check credit system
6. Test real-time updates (upload a resource and see it appear immediately)

### 3. Monitor Logs

```bash
# Railway logs
railway logs
```

## Troubleshooting

### Common Issues

#### 1. CORS Errors
- Verify `CORS_ORIGIN` in backend environment variables
- Ensure frontend domain matches exactly

#### 2. Database Connection Failures
- Check MongoDB URI format
- Verify IP whitelisting
- Confirm database user credentials

#### 3. API Calls Not Working
- Verify `REACT_APP_API_URL` points to correct backend
- Check if backend is running
- Review Railway deployment logs

#### 4. Authentication Issues
- Ensure `JWT_SECRET` is consistent
- Check token expiration settings
- Verify user registration flow

#### 5. WebSocket Connection Issues
- Verify `REACT_APP_WS_URL` is correctly configured
- Check if firewall/proxy is blocking WebSocket connections
- Ensure the backend WebSocket server is running

### Debugging Steps

1. Check Railway logs:
   ```bash
   railway logs
   ```

2. Test backend endpoints directly:
   ```bash
   curl https://your-backend-url/api/health
   ```

3. Verify environment variables:
   ```bash
   railway variables
   ```

4. Check MongoDB connection:
   - Use MongoDB Compass or similar tool
   - Test connection string independently

5. Test WebSocket connection:
   ```bash
   # Requires wscat to be installed
   wscat -c wss://your-backend-url/ws
   ```

## Maintenance

### Regular Tasks

1. **Database backups**
   - Set up automated backups in MongoDB Atlas
   - Regular export of critical data

2. **Security updates**
   - Regularly update npm packages
   - Monitor for security vulnerabilities

3. **Performance monitoring**
   - Monitor Railway resource usage
   - Set up alerts for high CPU/memory usage

4. **Backup environment variables**
   - Keep secure copies of all secrets
   - Document environment setup process

### Scaling

1. **Database scaling**
   - Upgrade MongoDB tier as needed
   - Implement database indexing

2. **Application scaling**
   - Railway automatically scales based on demand
   - Monitor performance metrics

3. **Feature enhancements**
   - Add caching with Redis
   - Implement CDN for static assets
   - Optimize database queries

## Support

For deployment issues, contact:
- GitHub Pages support: https://support.github.com/
- Railway support: https://docs.railway.app/
- MongoDB Atlas support: https://www.mongodb.com/support

For application-specific issues, check:
- Project documentation
- GitHub issues
- Community forums