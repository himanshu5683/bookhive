// backend/config/passport.js - Passport OAuth Configuration

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const User = require('../models/User');

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

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this OAuth ID
    let user = await User.findOne({ oauthId: profile.id, provider: 'google' });
    
    if (user) {
      return done(null, user);
    }
    
    // Check if user exists with this email (they may have signed up with email/password)
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Update existing user with OAuth info
      user.oauthId = profile.id;
      user.provider = 'google';
      if (!user.avatar) {
        user.avatar = profile.photos[0].value;
      }
      await user.save();
      return done(null, user);
    }
    
    // Create new user
    user = new User({
      name: profile.displayName || profile.name.givenName,
      email: profile.emails[0].value,
      oauthId: profile.id,
      provider: 'google',
      avatar: profile.photos[0].value
    });
    
    await user.save();
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this OAuth ID
    let user = await User.findOne({ oauthId: profile.id, provider: 'github' });
    
    if (user) {
      return done(null, user);
    }
    
    // Check if user exists with this email (they may have signed up with email/password)
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    if (email) {
      user = await User.findOne({ email });
      
      if (user) {
        // Update existing user with OAuth info
        user.oauthId = profile.id;
        user.provider = 'github';
        if (!user.avatar) {
          user.avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
        }
        await user.save();
        return done(null, user);
      }
    }
    
    // Create new user
    user = new User({
      name: profile.displayName || profile.username,
      email: email,
      oauthId: profile.id,
      provider: 'github',
      avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null
    });
    
    await user.save();
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Facebook OAuth Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['id', 'emails', 'name', 'picture.type(large)']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this OAuth ID
    let user = await User.findOne({ oauthId: profile.id, provider: 'facebook' });
    
    if (user) {
      return done(null, user);
    }
    
    // Check if user exists with this email (they may have signed up with email/password)
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    if (email) {
      user = await User.findOne({ email });
      
      if (user) {
        // Update existing user with OAuth info
        user.oauthId = profile.id;
        user.provider = 'facebook';
        if (!user.avatar) {
          user.avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
        }
        await user.save();
        return done(null, user);
      }
    }
    
    // Create new user
    user = new User({
      name: `${profile.name.givenName} ${profile.name.familyName}`,
      email: email,
      oauthId: profile.id,
      provider: 'facebook',
      avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null
    });
    
    await user.save();
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Twitter OAuth Strategy
passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: process.env.TWITTER_CALLBACK_URL,
  includeEmail: true
}, async (token, tokenSecret, profile, done) => {
  try {
    // Check if user already exists with this OAuth ID
    let user = await User.findOne({ oauthId: profile.id, provider: 'twitter' });
    
    if (user) {
      return done(null, user);
    }
    
    // Check if user exists with this email (they may have signed up with email/password)
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    if (email) {
      user = await User.findOne({ email });
      
      if (user) {
        // Update existing user with OAuth info
        user.oauthId = profile.id;
        user.provider = 'twitter';
        if (!user.avatar) {
          user.avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
        }
        await user.save();
        return done(null, user);
      }
    }
    
    // Create new user
    user = new User({
      name: profile.displayName || profile.username,
      email: email,
      oauthId: profile.id,
      provider: 'twitter',
      avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null
    });
    
    await user.save();
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

module.exports = passport;