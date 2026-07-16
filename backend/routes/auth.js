const axios = require("axios");
const bcrypt = require("bcryptjs");
const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'my-super-secret-jwt-key-12345-fallback', {
    expiresIn: '30d'
  });
};

const sendOTPEmail = async (email, otp) => {
  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        name: "Connection Hub",
        email: process.env.BREVO_FROM_EMAIL,
      },
      to: [
        {
          email,
        },
      ],
      subject: "Reset Password OTP",
      htmlContent: `
      <h2>Connection Hub</h2>
      <h3>Password Reset</h3>
      <p>Your OTP is</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
      `,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );
};

// Google OAuth routes (only if credentials are provided)
console.log('Google OAuth check:', !!process.env.GOOGLE_CLIENT_ID, !!process.env.GOOGLE_CLIENT_SECRET);
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('Registering Google OAuth routes');
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get('/google/callback', 
    (req, res, next) => {
      passport.authenticate('google', { session: false }, (err, user, info) => {
        if (err) {
          console.error('Google OAuth error:', err);
          return res.status(500).json({ message: 'OAuth error', error: err.message });
        }
        if (!user) {
          return res.status(401).json({ message: 'Authentication failed' });
        }
        req.user = user;
        next();
      })(req, res, next);
    },
    (req, res) => {
      try {
        // Create JWT token
        const token = generateToken(req.user._id);

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
      } catch (error) {
        console.error('Callback error:', error);
        res.status(500).json({ message: 'Callback error', error: error.message });
      }
    }
  );
}

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendOTPEmail(email, otp);

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      user.resetPasswordOTP !== otp ||
      new Date(user.resetPasswordOTPExpire) < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or Expired OTP",
      });
    }

    // New password save karo
    user.password = newPassword;

    // OTP clear karo
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpire = null;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
