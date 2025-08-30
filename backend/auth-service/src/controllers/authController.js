require('dotenv').config();

const axios = require('axios');
const User = require('../models/User');
const { encrypt } = require('../utils/cryptoUtil');
const { sign } = require('../utils/jwtUtil');

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const SERVER_URL = process.env.SERVER_URL || `https://auth-service-j350.onrender.com`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://react-app-e7c3.onrender.com/';

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  console.warn('⚠️ GitHub OAuth credentials not provided in env vars');
}

exports.githubRedirect = (req, res) => {
  const state = Math.random().toString(36).substring(2); // simple state; in prod store it server-side
  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo%20read:user%20user:email&state=${state}`;
  res.redirect(url);
};

exports.githubCallback = async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).send('Missing code from GitHub');

  try {
    // Exchange code for access token
    const tokenResp = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code
      },
      { headers: { Accept: 'application/json' } }
    );

    const tokenData = tokenResp.data;
    if (tokenData.error) {
      console.error('GitHub token error', tokenData);
      return res.status(400).json(tokenData);
    }

    const accessToken = tokenData.access_token;

    // Get user profile
    const userResp = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${accessToken}` }
    });

    const emailsResp = await axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `token ${accessToken}` }
    });

    const ghUser = userResp.data;
    const primaryEmail = Array.isArray(emailsResp.data) ? (emailsResp.data.find(e => e.primary)?.email || emailsResp.data[0]?.email) : null;

    // Upsert user in DB
    const encToken = encrypt(accessToken);
    const userDoc = await User.findOneAndUpdate(
      { githubId: String(ghUser.id) },
      {
        githubId: String(ghUser.id),
        login: ghUser.login,
        displayName: ghUser.name || ghUser.login,
        email: primaryEmail,
        avatarUrl: ghUser.avatar_url,
        accessToken: encToken
      },
      { upsert: true, new: true }
    );

    // Create JWT for the frontend
    const jwt = sign({
      sub: userDoc._id,
      githubId: userDoc.githubId,
      login: userDoc.login
    });

    // Redirect back to frontend with token as query param (or set cookie)
    // NOTE: In production prefer an httpOnly secure cookie.
    const redirectUrl = `${FRONTEND_URL}/oauth-success?token=${jwt}`;
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('❌ OAuth callback error:', err.response?.data || err.message || err);
    return res.status(500).send('OAuth failure');
  }
};
