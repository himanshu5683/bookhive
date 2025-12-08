// backend/config/passport.js - Passport OAuth Configuration

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import User from '../models/User.js';

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Helper function to find or create user
async function findOrCreateUser(profile, provider) {
  try {
    // Try to find existing user
    let user = await User.findOne({
      oauthId: profile.id,
      provider: provider
    });

    if (user) {
      return user;
    }

    // If user doesn't exist, create new user
    // Extract email (different providers have different structures)
    let email;
    if (profile.emails && profile.emails.length > 0) {
      email = profile.emails[0].value;
    } else if (profile.email) {
      email = profile.email;
    } else {
      // Generate a placeholder email if none provided
      email = `${provider}_${profile.id}@bookhive.local`;
    }

    // Check if user with this email already exists
    user = await User.findOne({ email: email });
    
    if (user) {
      // Link OAuth account to existing user
      user.oauthId = profile.id;
      user.provider = provider;
      // Update name if available
      if (profile.displayName) {
        user.name = profile.displayName;
      } else if (profile.name) {
        user.name = profile.name.givenName + ' ' + profile.name.familyName;
      }
      // Update avatar if available
      if (profile.photos && profile.photos.length > 0) {
        user.avatar = profile.photos[0].value;
      }
      await user.save();
    } else {
      // Create new user
      const name = profile.displayName || 
                  (profile.name ? profile.name.givenName + ' ' + profile.name.familyName : 'User');
      
      user = new User({
        oauthId: profile.id,
        provider: provider,
        email: email,
        name: name,
        // Avatar if available
        avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : undefined
      });
      
      await user.save();
    }

    return user;
  } catch (error) {
    throw error;
  }
}

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateUser(profile, 'google');
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
} else {
  console.log('Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)');
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateUser(profile, 'github');
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
} else {
  console.log('GitHub OAuth not configured (missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET)');
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'emails', 'name', 'picture.type(large)']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateUser(profile, 'facebook');
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
} else {
  console.log('Facebook OAuth not configured (missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET)');
}

// Twitter OAuth Strategy
// Commented out temporarily to avoid startup issues
// passport.use(new TwitterStrategy({
//   consumerKey: process.env.TWITTER_CONSUMER_KEY,
//   consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
//   callbackURL: process.env.TWITTER_CALLBACK_URL,
//   includeEmail: true
// }, async (token, tokenSecret, profile, done) => {
//   try {
//     const user = await findOrCreateUser(profile, 'twitter');
//     return done(null, user);
//   } catch (error) {
//     return done(error, null);
//   }
// }));

export default passport;