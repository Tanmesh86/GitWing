const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'AAGphO03oBMo2mrFy57BIXOjEUAUEu6x02BWtmJjjKM=';

function sign(payload, opts = {}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: opts.expiresIn || '7d' });
}

function verify(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = { sign, verify };
