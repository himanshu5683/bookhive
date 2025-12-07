// backend/routes/oauth.js - OAuth Authentication Routes

import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../models/User.js';

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Helper function to format user response
const formatUserResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    credits: user.credits,
    avatar: user.avatar,
    provider: user.provider
  };
};

// Helper function to get frontend URL
const getFrontendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.PRODUCTION_URL || 'https://himanshu5683.github.io/bookhive';
  }
  return process.env.REACT_APP_URL || 'http://localhost:3000';
};

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const token = generateToken(req.user._id);
      
      // Redirect to frontend with token and user data
      const frontendUrl = getFrontendUrl();
      const userData = encodeURIComponent(JSON.stringify(formatUserResponse(req.user)));
      
      res.redirect(`${frontendUrl}/oauth/callback?token=${token}&user=${userData}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const frontendUrl = getFrontendUrl();
      res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Server error during Google authentication')}`);
    }
  }
);

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', {
  scope: ['user:email']
}));

router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const token = generateToken(req.user._id);
      
      // Redirect to frontend with token and user data
      const frontendUrl = getFrontendUrl();
      const userData = encodeURIComponent(JSON.stringify(formatUserResponse(req.user)));
      
      res.redirect(`${frontendUrl}/oauth/callback?token=${token}&user=${userData}`);
    } catch (error) {
      console.error('GitHub OAuth callback error:', error);
      const frontendUrl = getFrontendUrl();
      res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Server error during GitHub authentication')}`);
    }
  }
);

// Facebook OAuth routes
router.get('/facebook', passport.authenticate('facebook', {
  scope: ['email']
}));

router.get('/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const token = generateToken(req.user._id);
      
      // Redirect to frontend with token and user data
      const frontendUrl = getFrontendUrl();
      const userData = encodeURIComponent(JSON.stringify(formatUserResponse(req.user)));
      
      res.redirect(`${frontendUrl}/oauth/callback?token=${token}&user=${userData}`);
    } catch (error) {
      console.error('Facebook OAuth callback error:', error);
      const frontendUrl = getFrontendUrl();
      res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Server error during Facebook authentication')}`);
    }
  }
);

// Twitter OAuth routes
router.get('/twitter', passport.authenticate('twitter'));

router.get('/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const token = generateToken(req.user._id);
      
      // Redirect to frontend with token and user data
      const frontendUrl = getFrontendUrl();
      const userData = encodeURIComponent(JSON.stringify(formatUserResponse(req.user)));
      
      res.redirect(`${frontendUrl}/oauth/callback?token=${token}&user=${userData}`);
    } catch (error) {
      console.error('Twitter OAuth callback error:', error);
      const frontendUrl = getFrontendUrl();
      res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Server error during Twitter authentication')}`);
    }
  }
);

export default router;
