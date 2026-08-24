const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { User } = require('../models');

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  neighborhood: z.string().optional(),
  phone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const user = await User.create(data);
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user: user.toSafeJSON(),
        token
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error.',
        errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    
    const user = await User.findOne({ where: { email: data.email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isValid = await user.validatePassword(data.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: user.toSafeJSON(),
        token
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error.',
        errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      data: { user: user.toSafeJSON() }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PATCH /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'neighborhood', 'phone'];
    const updates = {};
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    await req.user.update(updates);
    
    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user: req.user.toSafeJSON() }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { register, login, getMe, updateProfile };
