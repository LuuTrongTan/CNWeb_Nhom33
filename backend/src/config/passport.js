const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user.model');

// Local Strategy for email/password auth
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email, authMethod: 'local' });
      
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      
      const isValidPassword = await user.comparePassword(password);
      
      if (!isValidPassword) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Google OAuth Strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        return done(null, user);
      }
      
      // Check if user exists with same email
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // Update existing user with Google ID
        user.googleId = profile.id;
        user.authMethod = 'google';
        await user.save();
        return done(null, user);
      }
      
      // Create new user
      const newUser = new User({
        email: profile.emails[0].value,
        name: profile.displayName,
        googleId: profile.id,
        authMethod: 'google',
        profile: {
          avatar: profile.photos[0].value
        }
      });
      
      await newUser.save();
      return done(null, newUser);
    } catch (error) {
      return done(error);
    }
  }
));

// Facebook OAuth Strategy
passport.use(new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/api/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name', 'picture.type(large)']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ facebookId: profile.id });
      
      if (user) {
        return done(null, user);
      }
      
      // Check if user exists with same email (if email available)
      if (profile.emails && profile.emails.length > 0) {
        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          // Update existing user with Facebook ID
          user.facebookId = profile.id;
          user.authMethod = 'facebook';
          await user.save();
          return done(null, user);
        }
      }
      
      // Create new user
      const newUser = new User({
        email: profile.emails ? profile.emails[0].value : `${profile.id}@facebook.com`,
        name: `${profile.name.givenName} ${profile.name.familyName}`,
        facebookId: profile.id,
        authMethod: 'facebook',
        profile: {
          avatar: profile.photos ? profile.photos[0].value : null
        }
      });
      
      await newUser.save();
      return done(null, newUser);
    } catch (error) {
      return done(error);
    }
  }
));

// JWT Strategy for token authentication
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(
  jwtOptions,
  async (payload, done) => {
    try {
      const user = await User.findById(payload.id);
      
      if (!user) {
        return done(null, false);
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
));

module.exports = passport; 