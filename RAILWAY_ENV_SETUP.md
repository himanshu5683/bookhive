# Railway Environment Variables Setup Guide

This guide will help you set up the required environment variables for your BookHive backend on Railway.

## Accessing Railway Environment Variables

1. Go to https://railway.com and log in to your account
2. Navigate to your "BookHive" project
3. Click on the "Settings" tab
4. Click on "Variables" in the left sidebar
5. Add the following environment variables:

## Required Environment Variables

### Core Configuration
```
NODE_ENV=production
```

### Database Configuration
```
MONGODB_URI=mongodb+srv://bookhive_user:HIMANSHU2005@cluster0.pujtcl4.mongodb.net/bookhive?retryWrites=true&w=majority
```

### Security Secrets
```
JWT_SECRET=your_strong_jwt_secret_here
SESSION_SECRET=your_strong_session_secret_here
```

### Frontend URLs (for CORS)
```
REACT_APP_URL=https://himanshu5683.github.io/bookhive
PRODUCTION_URL=https://himanshu5683.github.io/bookhive
FRONTEND_URL=https://himanshu5683.github.io/bookhive
```

### OpenAI API (Optional - for AI features)
```
OPENAI_API_KEY=your_openai_api_key_here
```

### OAuth Credentials

#### Google OAuth
```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=https://bookhive-backend-production.up.railway.app/api/oauth/google/callback
```

#### GitHub OAuth
```
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_CALLBACK_URL=https://bookhive-backend-production.up.railway.app/api/oauth/github/callback
```

#### Facebook OAuth
```
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
FACEBOOK_CALLBACK_URL=https://bookhive-backend-production.up.railway.app/api/oauth/facebook/callback
```

#### Twitter OAuth
```
TWITTER_CALLBACK_URL=https://bookhive-backend-production.up.railway.app/api/oauth/twitter/callback
```

## Security Best Practices

1. **Never commit sensitive environment variables** to your Git repository
2. **Use strong, random secrets** for JWT_SECRET and SESSION_SECRET
3. **Rotate secrets regularly** for enhanced security
4. **Limit access** to environment variables to authorized team members only

## Updating Environment Variables

To update environment variables in Railway:

1. Go to your Railway project dashboard
2. Navigate to "Settings" > "Variables"
3. Click the "Edit" button next to any variable to modify its value
4. Click "Add Variable" to add new environment variables
5. Changes are applied automatically - no redeployment needed for environment variable changes

## Verification

After setting up all environment variables, you can verify your deployment by:

1. Visiting your app's health endpoint: `https://bookhive-backend-production.up.railway.app/api/health`
2. Checking the Railway logs for any errors
3. Testing authentication endpoints with valid credentials

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify MONGODB_URI is correctly formatted
   - Check MongoDB Atlas IP whitelist includes Railway's IPs
   - Ensure database credentials are correct

2. **JWT or Session Errors**
   - Verify JWT_SECRET and SESSION_SECRET are set
   - Ensure secrets are sufficiently strong/random

3. **CORS Errors**
   - Verify REACT_APP_URL, PRODUCTION_URL, and FRONTEND_URL are set correctly
   - Check that your frontend domain is included in the allowedOrigins array in server.js

4. **OAuth Failures**
   - Verify all OAuth credentials are correctly set
   - Ensure callback URLs match exactly with what's configured in OAuth providers
   - Check that OAuth provider configurations point to your Railway URLs

## Next Steps

1. Update your frontend to point to your Railway backend
2. Test the complete authentication flow
3. Verify all API endpoints work correctly
4. Test OAuth integrations if you're using them