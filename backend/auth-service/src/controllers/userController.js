const User = require('../models/User');
const { verify } = require('../utils/jwtUtil');

exports.me = async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });

  const token = auth.split(' ')[1];
  const payload = verify(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  try {
    const user = await User.findById(payload.sub).select('-accessToken -__v');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('❌ /me error', err);
    res.status(500).json({ error: 'Server error' });
  }
};
