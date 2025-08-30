import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import jwt from 'jsonwebtoken';

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from parent folder
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import User model (create this model in ./models/User.js)
import User from './models/User.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Auth Service: Mongo connected'))
.catch(err => {
  console.error('❌ Auth Service: Mongo connection error', err);
  process.exit(1);
});

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://react-app-e7c3.onrender.com',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set true if HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// GitHub OAuth Strategy
passport.use(new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Find user by GitHub ID
      let user = await User.findOne({ githubId: profile.id });

      if (!user) {
        // Create new user if not exists
        user = new User({
          githubId: profile.id,
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl: profile.photos?.[0]?.value || '',
          email: profile.emails?.[0]?.value || '',
          accessToken // Save GitHub OAuth access token
        });
        await user.save();
      } else {
        // Update token on every login (optional, recommended)
        user.accessToken = accessToken;
        await user.save();
      }
      done(null, user);
    } catch (err) {
      done(err);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Routes
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    // Generate JWT token with user info AND GitHub access token
    const payload = {
      id: req.user.id,
      username: req.user.username,
      displayName: req.user.displayName,
      email: req.user.email,
      avatarUrl: req.user.avatarUrl,
      githubAccessToken: req.user.accessToken, // include the GitHub OAuth token here
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Redirect to frontend OAuth success with token
    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
  }
);

app.get('/auth/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect(process.env.FRONTEND_URL || '/');
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Auth Service running ✅" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Auth Service running on port ${PORT}`);
});
