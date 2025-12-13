# BookHive Deployment Checklist

This checklist ensures that all necessary steps are completed for both local development and Railway deployment.

## Backend Configuration ✅

### Node.js Version
- [x] Added .nvmrc file in backend folder with "20.18.0"
- [x] Updated backend/package.json engines section to use Node.js version 20.18.0

### Railway Configuration
- [x] Updated railway.json with:
  - Root Directory: backend
  - Build Command: npm ci --omit=dev
  - Start Command: npm start

### MongoDB Connection
- [x] Implemented global flag isConnected to prevent multiple connections
- [x] Updated mongoose.connect with:
  - serverSelectionTimeoutMS: 30000
  - socketTimeoutMS: 45000
  - connectTimeoutMS: 30000
  - maxPoolSize: 5
  - retryWrites: true
- [x] Removed deprecated options: useNewUrlParser, useUnifiedTopology, tls

### CORS Configuration
- [x] Updated CORS middleware in server.js:
  - origin: ["https://himanshu5683.github.io", "https://himanshu5683.github.io/bookhive"]
  - methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  - allowedHeaders: ["Content-Type", "Authorization"]
  - credentials: true
- [x] Handle preflight requests with: app.options("*", cors())

## Frontend Configuration ✅

### Environment Variables
- [x] REACT_APP_API_URL=https://bookhive-backend-production.up.railway.app/api
- [x] REACT_APP_WS_URL=wss://bookhive-backend-production.up.railway.app
- [x] REACT_APP_URL=https://himanshu5683.github.io/bookhive
- [x] Frontend uses these env variables in all API and WebSocket calls
- [x] Included withCredentials: true for Axios requests

## Development Workflow

### Local Development Setup
- [ ] Backend: cd backend → npm run dev
- [ ] Frontend: npm start
- [ ] Test login/signup functionality
- [ ] Verify MongoDB connections
- [ ] Test OAuth integrations
- [ ] Verify WebSocket connections

### Testing Checklist
- [ ] Authentication (login/signup) works locally
- [ ] Database operations work correctly
- [ ] OAuth flows function properly
- [ ] WebSocket connections establish successfully
- [ ] API endpoints respond correctly
- [ ] CORS is properly configured for localhost

## Deployment Workflow

### Railway Deployment
- [ ] Push backend code to GitHub
- [ ] Railway automatically redeploys backend
- [ ] Verify MongoDB connects successfully on Railway
- [ ] Check Railway logs for any errors

### Frontend Deployment
- [ ] Delete old build folder
- [ ] Run npm run build
- [ ] Deploy build folder to GitHub Pages
- [ ] Verify frontend connects correctly to Railway backend

### Post-Deployment Verification
- [ ] Test authentication (login/signup) on deployed app
- [ ] Verify database operations work on production
- [ ] Check OAuth integrations on deployed app
- [ ] Confirm WebSocket connections work in production
- [ ] Validate all API endpoints function correctly
- [ ] Ensure CORS is properly configured for production

## Common Issues and Solutions

### Network Errors
- [ ] Ensure withCredentials is set to true for all API requests
- [ ] Verify CORS configuration allows the frontend domain
- [ ] Check that environment variables are correctly set in Railway

### MongoDB Connection Issues
- [ ] Verify MONGODB_URI is correctly set in Railway environment variables
- [ ] Ensure MongoDB Atlas IP whitelist includes Railway's IP addresses
- [ ] Check that the connection string format is correct

### Authentication Problems
- [ ] Confirm JWT_SECRET and SESSION_SECRET are set in Railway
- [ ] Verify that cookies are being sent with requests (withCredentials: true)
- [ ] Check that the frontend and backend URLs match the CORS configuration

### OAuth Failures
- [ ] Ensure OAuth callback URLs are correctly configured in both:
  - OAuth provider settings
  - Railway environment variables
- [ ] Verify that all OAuth credentials are correctly set in Railway

## Final Verification

- [ ] All checklist items completed
- [ ] Local development environment works correctly
- [ ] Railway deployment successful
- [ ] Frontend deployed to GitHub Pages
- [ ] All functionality tested and working in production