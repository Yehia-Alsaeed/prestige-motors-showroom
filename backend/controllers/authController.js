const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

// @desc    Register new customer
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { firstName, lastName, email, phone, password, address, city, country } = req.body;

  if (!firstName || !lastName || !email || !phone || !password) {
    return res.status(400).json({ message: 'Please add all required fields' });
  }

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    passwordHash: password,
    address: address || '',
    city: city || '',
    country: country || '',
    role: 'customer' // Force customer role
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (user.accountStatus === 'disabled') {
      return res.status(403).json({ message: 'Account is disabled.' });
    }

    res.json({
      _id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

// @desc    Authenticate an admin
// @route   POST /api/auth/admin-login
// @access  Public
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && user.role === 'admin' && (await user.matchPassword(password))) {
    res.json({
      _id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid admin credentials' });
  }
};

// @desc    Get user profile completely
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    if (req.body.address !== undefined) user.address = req.body.address;
    if (req.body.city !== undefined) user.city = req.body.city;
    if (req.body.country !== undefined) user.country = req.body.country;

    if (req.body.password) {
      user.passwordHash = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  const users = await User.find({ role: 'customer' }).select('-passwordHash');
  res.json(users);
};

// @desc    Update user account status (Admin only)
// @route   PUT /api/auth/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.accountStatus = req.body.status || 'active';
    await user.save();
    res.json({ message: `Account status updated to ${user.accountStatus}` });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  loginAdmin,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateUserStatus,
};
