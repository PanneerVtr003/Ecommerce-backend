// Temporary auth controller that works without MongoDB
const generateToken = require('../utils/generateToken');

// In-memory user storage (for development only)
let tempUsers = [];

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log('🔧 Temporary registration:', { username, email });

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user exists
    const userExists = tempUsers.find(user => 
      user.email === email || user.username === username
    );

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create temporary user
    const tempUser = {
      _id: 'temp_' + Date.now(),
      username,
      email,
      password: 'encrypted_in_real_scenario', // In real app, hash this
      role: 'user',
      createdAt: new Date()
    };

    tempUsers.push(tempUser);

    const token = generateToken(tempUser._id);
    
    console.log('✅ Temporary user registered:', tempUser._id);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully (temporary storage)',
      user: {
        _id: tempUser._id,
        username: tempUser.username,
        email: tempUser.email,
        role: tempUser.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔧 Temporary login:', { email });

    // Find user in temporary storage
    const user = tempUsers.find(u => u.email === email);

    if (user) {
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: 'Login successful (temporary storage)',
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

module.exports = {
  registerUser,
  loginUser
};