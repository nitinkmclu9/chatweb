const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Function to generate a unique username
async function generateUniqueUsername(baseName) {
  let username = baseName;
  let counter = 1;
  
  while (await User.findOne({ username })) {
    username = `${baseName}${counter}`;
    counter++;
  }
  
  return username;
}

// Only initialize Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
       callbackURL: 'http://localhost:5000/api/auth/google/callback',
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
      try {
        // First check if user exists with this googleId
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Then check if user exists with this email (they might have signed up with email/password before)
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // If user exists with email, add googleId to their account
          user.googleId = profile.id;
          if (!user.avatar && profile.photos && profile.photos.length > 0) {
            user.avatar = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }

        // If user doesn't exist at all, create a new one with unique username
        // Use displayName if available, else email prefix, else a random string
        let baseUsername = 'user';
        if (profile.displayName) {
          baseUsername = profile.displayName.replace(/\s+/g, '').toLowerCase();
        } else if (profile.emails && profile.emails[0] && profile.emails[0].value) {
          baseUsername = profile.emails[0].value.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        }
        const uniqueUsername = await generateUniqueUsername(baseUsername);
        
        user = await User.create({
          googleId: profile.id,
          username: uniqueUsername,
          email: profile.emails[0].value,
          avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : ''
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
      }
    )
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
