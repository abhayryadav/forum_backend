const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

const auth = {
  // Generate JWT token
  generateToken: (user) => {
    return jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email // if you have email field
      },
      JWT_SECRET,
      { expiresIn: '1d' } // Token expires in 7 days
    );
  },

  // Verify JWT middleware
  requireAuth: async (req, res, next) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from database (optional, you can use just the token data)
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }


      
      // Attach user data to request
      req.user = user;
      req.tokenData = decoded; // Contains all JWT data
      req.superuser = user.role === 'admin';
      
      next();
    } catch (error) {
      console.error('JWT verification error:', error.message);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      
      res.status(500).json({ error: 'Authentication failed' });
    }
  },


};

module.exports = auth;