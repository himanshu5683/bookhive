# Network Issue Fix for BookHive Login/Signup

## Problem
Users are experiencing "Network error. Please check your connection." when trying to login or signup on the BookHive website hosted at https://himanshu5683.github.io/bookhive/

## Root Causes Identified
1. CORS configuration not properly allowing GitHub Pages domain
2. Session cookie configuration not properly set for cross-domain usage
3. Insufficient error handling in frontend to show real backend errors

## Fixes Implemented

### 1. Backend Server Configuration (server.js)
- Updated session cookie configuration to always use secure cookies
- Enhanced CORS configuration to be more permissive for GitHub Pages subdomains
- Added explicit CORS headers middleware
- Improved CORS preflight handling

### 2. Frontend API Client (api.js)
- Enhanced error handling with detailed logging
- Added request/response details to error messages
- Maintained existing withCredentials configuration

### 3. Authentication Components (Login.jsx/Signup.jsx)
- Kept existing improved error handling

## Test Commands

### CURL Test Commands

#### Test Health Endpoint
```bash
curl -X GET https://bookhive-backend-production.up.railway.app/api/health
```

#### Test CORS Preflight
```bash
curl -X OPTIONS https://bookhive-backend-production.up.railway.app/api/auth/login \
  -H "Origin: https://himanshu5683.github.io" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

#### Test Login (will fail with invalid credentials, but test network connectivity)
```bash
curl -X POST https://bookhive-backend-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://himanshu5683.github.io" \
  -d '{"email": "test@example.com", "password": "testpassword"}' \
  -v
```

### Node.js Test Script
Run the test-network-issue.js script to diagnose network issues:

```bash
node test-network-issue.js
```

## Expected Results After Fix

1. CORS preflight requests should succeed with proper headers
2. Login/Signup requests should reach the backend
3. Error messages should show real backend errors instead of generic "Network error"
4. Cookies should be properly handled for cross-domain requests

## If Issues Persist

1. Check Railway logs for any deployment issues
2. Verify MongoDB connection is working properly
3. Ensure all environment variables are correctly set in Railway
4. Check if the backend domain (bookhive-backend-production.up.railway.app) is accessible
5. Consider hosting the frontend on Vercel/Netlify for better CORS support if GitHub Pages continues to have issues