const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs'); // For password hashing
const router = express.Router();

// Signup route with role selection
router.post('/signup', async (req, res) => {
  const { password, email, role , SecretKey} = req.body;
  
  // Validation
  if (!password || !email || !role) {
    return res.status(400).json({ 
      error: 'Username, email and password are required' 
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ 
      error: 'Password must be at least 6 characters' 
    });
  }

  // Validate role
  const validRoles = ['user','admin']; // Add more roles if needed
  const userRole = role && validRoles.includes(role) ? role : 'user';
  console.log(userRole)
  console.log(SecretKey)
  if(userRole ===  'admin' && SecretKey != '2134'){
    return res.status(409).json({ 
        error: 'invalid secret key' 
      });
  }

  console.log(req.body)
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Username or email already exists' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = new User({ 
      email,
      password: hashedPassword,
      role: userRole
    });
    
    await user.save();
    
    // Generate JWT token
    const token = auth.generateToken(user);
    
    // Return user data (without password) and token
    const userResponse = {
      _id: user._id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };
    
    res.status(201).json({ 
      message: 'User created successfully', 
      user: userResponse,
      token 
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'email and password are required' 
    });
  }
  
  try {
    // Find user by username or email
    const user = await User.findOne({ email:email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Compare passwords using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = auth.generateToken(user);
    
    // Return user data (without password) and token
    const userResponse = {
      _id: user._id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };
    
    res.json({ 
      message: 'Logged in successfully', 
      user: userResponse,
      token 
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', auth.requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', auth.requireAuth, async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove fields that shouldn't be updated
    delete updates.password;
    delete updates.role; // Role changes should be separate endpoint
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ 
      message: 'Profile updated successfully',
      user 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout route (client-side JWT removal)
router.post('/logout', (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  res.json({ message: 'Logged out successfully' });
});



// Check token validity
router.get('/verify-token', auth.requireAuth, (req, res) => {
    console.log("vfff")
  res.json({ 
    valid: true, 
    user: req.user,
    tokenData: req.tokenData 
  });
});

module.exports = router;