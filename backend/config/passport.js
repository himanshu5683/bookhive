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
    const user = await findOrCreateUser(profile, 'google');
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
    const user = await findOrCreateUser(profile, 'github');
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
    const user = await findOrCreateUser(profile, 'facebook');
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

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

module.exports = passport;