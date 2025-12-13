# BookHive Deployment Verification

This document outlines the steps to verify that your BookHive application is correctly deployed and functioning on Railway.

## Pre-Deployment Checklist

- [ ] Code is committed and pushed to your GitHub repository
- [ ] Railway project is created and connected to your GitHub repo
- [ ] All environment variables are set in Railway
- [ ] MongoDB Atlas cluster is accessible from Railway
- [ ] Custom domain (if applicable) is configured

## Post-Deployment Verification Steps

### 1. Check Railway Dashboard

1. Go to your Railway project dashboard
2. Verify the deployment status shows "Success"
3. Check the logs for any errors during startup
4. Note the assigned Railway URL (usually something like `your-app-name.up.railway.app`)

### 2. Test Health Endpoints

Visit these URLs in your browser or use curl:

```
# Health check endpoint
curl https://your-railway-app-url.up.railway.app/api/health

# Expected response:
{
  "status": "ok",
  "db": "connected",
  "timestamp": "2023-XX-XXTXX:XX:XX.XXXZ",
  "message": "BookHive Backend is running successfully"
}

# Root endpoint
curl https://your-railway-app-url.up.railway.app/

# Expected response:
{
  "status": "ok",
  "message": "BookHive Backend is running",
  "timestamp": "2023-XX-XXTXX:XX:XX.XXXZ"
}
```

### 3. Test Authentication Endpoints

Use curl or Postman to test authentication:

```
# Test signup with missing data (should return 400)
curl -X POST https://your-railway-app-url.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{}'

# Test login with missing data (should return 400)
curl -X POST https://your-railway-app-url.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{}'

# Test login with invalid credentials (should return 401)
curl -X POST https://your-railway-app-url.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "nonexistent@example.com", "password": "wrongpassword"}'
```

### 4. Verify CORS Configuration

Check that your frontend can make requests to the backend:

1. Deploy your frontend to GitHub Pages or another hosting service
2. Try to log in through the frontend interface
3. Check browser developer tools for any CORS errors

### 5. Test OAuth Endpoints

Verify OAuth redirects work correctly:

```
# Google OAuth (should redirect)
curl -I https://your-railway-app-url.up.railway.app/api/oauth/google

# GitHub OAuth (should redirect)
curl -I https://your-railway-app-url.up.railway.app/api/oauth/github

# Facebook OAuth (should redirect)
curl -I https://your-railway-app-url.up.railway.app/api/oauth/facebook
```

## Common Issues and Solutions

### 1. Database Connection Issues

**Symptoms:**
- Application crashes on startup
- Health check shows "db": "disconnected"

**Solutions:**
- Verify MONGODB_URI environment variable is set correctly
- Check MongoDB Atlas IP whitelist includes Railway's IP ranges
- Ensure MongoDB user has proper permissions

### 2. CORS Errors

**Symptoms:**
- Frontend cannot make API requests
- Browser shows CORS-related errors

**Solutions:**
- Verify FRONTEND_URL, REACT_APP_URL, and PRODUCTION_URL environment variables
- Check that your domain is included in the allowedOrigins array in server.js

### 3. Environment Variables Not Set

**Symptoms:**
- Application crashes with "undefined" errors
- Authentication fails unexpectedly

**Solutions:**
- Double-check all required environment variables are set in Railway
- Verify variable names match what the application expects

### 4. Port Configuration Issues

**Symptoms:**
- Application fails to bind to port

**Solutions:**
- Ensure your server.js uses `process.env.PORT || 5003` for the port
- Don't set a fixed PORT in your environment variables

## Success Criteria

Your deployment is successful when:

- [ ] Railway dashboard shows deployment as successful
- [ ] Health check endpoint returns status "ok"
- [ ] Database connection is established
- [ ] Authentication endpoints respond correctly
- [ ] Frontend can communicate with backend without CORS errors
- [ ] OAuth redirects work properly

## Next Steps

Once deployment is verified:

1. Update your frontend's `.env.production` to point to your new Railway backend URL
2. Redeploy your frontend if necessary
3. Test the complete user flow (signup, login, accessing protected resources)
4. Monitor logs for any runtime errors

If you encounter any issues during verification, refer to the troubleshooting section above or check the Railway logs for detailed error messages.