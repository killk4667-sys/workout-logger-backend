const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate a signed JWT for a user
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Register a new user
 */
const registerUser = async ({ username, email, password }) => {
  // Check if email or username already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    const field = existingUser.email === email ? 'email' : 'username';
    const error = new Error(`A user with this ${field} already exists`);
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({ username, email, password });
  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    },
  };
};

/**
 * Login an existing user
 */
const loginUser = async ({ email, password }) => {
  // Must explicitly select password since it has select:false
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    },
  };
};

/**
 * Get current authenticated user profile
 */
const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

module.exports = { registerUser, loginUser, getMe };
