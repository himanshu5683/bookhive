# BookHive Deployment Guide

## GitHub Pages Deployment

### Prerequisites
1. Ensure all changes are committed to your repository
2. Make sure the `homepage` field in `package.json` is set correctly

### Deployment Steps

1. **Build the React Application**
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages**
   ```bash
   npm run deploy
   ```

### Configuration Details

The `homepage` field in `package.json` is already configured as:
```json
"homepage": "https://himanshu5683.github.io/bookhive"
```

The deployment scripts are already configured in `package.json`:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

### Routing Configuration

We're using `HashRouter` instead of `BrowserRouter` to ensure compatibility with GitHub Pages:
```javascript
import { HashRouter } from "react-router-dom";
```

This prevents routing issues that commonly occur with GitHub Pages.

### Environment Variables

Make sure your `.env` file contains the correct API URL:
```
REACT_APP_API_URL=https://bookhive-backend-production.up.railway.app/api
```

### Post-Deployment

After deployment, your application will be available at:
https://himanshu5683.github.io/bookhive

## Backend Deployment

For deploying the backend, we recommend using a platform like Railway.app or Heroku.

### Railway.app Deployment Steps

1. Sign up at [Railway.app](https://railway.app/)
2. Connect your GitHub repository
3. Set environment variables in the Railway dashboard:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Your JWT secret key
   - `NODE_ENV` - Set to "production"
4. Deploy!

### Environment Variables for Backend

```
PORT=5000
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
REACT_APP_URL=https://himanshu5683.github.io/bookhive
PRODUCTION_URL=https://himanshu5683.github.io/bookhive
```

## Troubleshooting

### Common Issues

1. **Blank Page After Deployment**
   - Check browser console for errors
   - Ensure `homepage` field in `package.json` matches your GitHub Pages URL
   - Verify all environment variables are correctly set

2. **API Connection Errors**
   - Confirm backend is deployed and running
   - Check CORS configuration in backend
   - Verify `REACT_APP_API_URL` is correctly set in `.env`

3. **Routing Issues**
   - Make sure you're using `HashRouter` for GitHub Pages
   - Avoid using `BrowserRouter` with GitHub Pages

### Need Help?

If you encounter any issues during deployment, please check:
- GitHub Actions logs
- Browser developer console
- Network tab for API call failures