# BookHive OAuth Setup Guide

This guide explains how to set up social login for Google, GitHub, Facebook, and Twitter in your BookHive application.

## Prerequisites

1. Make sure you have the latest version of the BookHive codebase
2. Have access to developer accounts for each OAuth provider you want to integrate

## Setting up OAuth Providers

### 1. Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Set the authorized redirect URI to:
   - Development: `http://localhost:5002/api/oauth/google/callback`
   - Production: `https://your-domain.com/api/oauth/google/callback`
6. Copy the Client ID and Client Secret to your `.env` file:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```

### 2. GitHub OAuth

1. Go to your GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Set the authorization callback URL to:
   - Development: `http://localhost:5002/api/oauth/github/callback`
   - Production: `https://your-domain.com/api/oauth/github/callback`
4. Copy the Client ID and Client Secret to your `.env` file:
   ```
   GITHUB_CLIENT_ID=your_github_client_id_here
   GITHUB_CLIENT_SECRET=your_github_client_secret_here
   ```

### 3. Facebook OAuth

1. Go to the [Facebook Developers](https://developers.facebook.com/) site
2. Create a new app or select an existing one
3. Add the "Facebook Login" product
4. Set the valid OAuth redirect URIs to:
   - Development: `http://localhost:5002/api/oauth/facebook/callback`
   - Production: `https://your-domain.com/api/oauth/facebook/callback`
5. Copy the App ID and App Secret to your `.env` file:
   ```
   FACEBOOK_APP_ID=your_facebook_app_id_here
   FACEBOOK_APP_SECRET=your_facebook_app_secret_here
   ```

### 4. Twitter OAuth

1. Go to the [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app or select an existing one
3. Set the callback URI to:
   - Development: `http://localhost:5002/api/oauth/twitter/callback`
   - Production: `https://your-domain.com/api/oauth/twitter/callback`
4. Enable "Sign in with Twitter"
5. Copy the API Key and API Secret to your `.env` file:
   ```
   TWITTER_CONSUMER_KEY=your_twitter_consumer_key_here
   TWITTER_CONSUMER_SECRET=your_twitter_consumer_secret_here
   ```

## Environment Variables

Update your `backend/.env` file with the credentials from each provider:

```env
# OAuth Credentials (Replace with your actual credentials)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
TWITTER_CONSUMER_KEY=your_twitter_consumer_key_here
TWITTER_CONSUMER_SECRET=your_twitter_consumer_secret_here

# Callback URLs
GOOGLE_CALLBACK_URL=http://localhost:5002/api/oauth/google/callback
GITHUB_CALLBACK_URL=http://localhost:5002/api/oauth/github/callback
FACEBOOK_CALLBACK_URL=http://localhost:5002/api/oauth/facebook/callback
TWITTER_CALLBACK_URL=http://localhost:5002/api/oauth/twitter/callback
```

## Testing OAuth

1. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start your frontend:
   ```bash
   npm start
   ```

3. Navigate to the login or signup page
4. Click on any of the social login buttons
5. You should be redirected to the provider's authentication page
6. After authenticating, you should be redirected back to your app and logged in

## Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**: Make sure the callback URLs in your OAuth provider settings exactly match the ones in your `.env` file.

2. **CORS Errors**: Ensure your frontend URL is included in the CORS configuration in `backend/server.js`.

3. **Missing Environment Variables**: Double-check that all required environment variables are set in your `.env` file.

4. **Session Issues**: If you're having issues with sessions, make sure the session secret in `backend/server.js` is properly configured.

### Debugging Tips

1. Check the browser console for any JavaScript errors
2. Check the backend logs for any authentication errors
3. Verify that the OAuth provider is returning the expected user data
4. Make sure the JWT token is being properly stored in localStorage

## Security Considerations

1. **Environment Variables**: Never commit your `.env` file to version control
2. **HTTPS**: Use HTTPS in production environments
3. **Session Management**: Regularly rotate your session secrets
4. **Token Storage**: JWT tokens are stored in localStorage, which is acceptable for SPA applications but consider additional security measures for higher-security applications

## Customization

You can customize the appearance of the social login buttons by modifying:
- `src/components/SocialAuthButton.jsx` - Button component
- `src/styles/Auth.css` - Styling for the buttons

You can also modify the OAuth flow by updating:
- `src/auth/AuthContext.jsx` - Authentication context
- `backend/routes/oauth.js` - OAuth routes
- `backend/config/passport.js` - Passport strategies