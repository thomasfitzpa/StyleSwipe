import { ConflictError, UnauthorizedError, ValidationError } from '../errors/errors.js';
import { validationResult } from 'express-validator';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.js';
import User from '../models/userModel.js';

//register
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array(), 'Invalid user data provided');
  }

  const { username, email, password } = req.body;

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new ConflictError('Username or email already in use');
  }

  const user = new User({ username, email, password });
  await user.save();

  res.status(201).json({ message: 'User registered successfully', userId: user._id });
};

//login
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array(), 'Invalid login data provided');
  }

  const { identifier, password } = req.body;

  const user = await User.findOne({
    $or: [{ username: identifier }, { email: identifier }]
  }).select('+password');

  if (!user) throw new UnauthorizedError('No user found with this username or email');

  if (!(await user.comparePassword(password))) {
    throw new UnauthorizedError('Password is incorrect');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  user.lastActive = Date.now();
  await user.save();

  res.status(200).json({ accessToken, refreshToken });
};

//refresh token
export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new UnauthorizedError('No refresh token in request');
  }

  const decoded = await verifyRefreshToken(refreshToken);

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    throw new UnauthorizedError('No user with this refresh token found');
  }

  if (user.lastActive < Date.now() - 14 * 24 * 60 * 60 * 1000) {
    user.refreshToken = null;
    await user.save();
    throw new UnauthorizedError('Session timed out due to inactivity');
  }
  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refreshToken = newRefreshToken;
  user.lastActive = Date.now();
  await user.save();

  res.status(200).json({ accessToken, refreshToken: newRefreshToken });
};

export const logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new UnauthorizedError('No refresh token in request');
  const decoded = await verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    throw new UnauthorizedError('No user with this refresh token found');
  }
  user.refreshToken = null;
  await user.save();

  res.status(200).json({ message: 'Logged out successfully' });
};

export const onboarding = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array(), 'Invalid onboarding data provided');
  }
  const user = req.user;
  if (!user) throw new UnauthorizedError('Authentication required');
  const {
    gender,
    shoeSize,
    shirtSize,
    shortSize,
    pantsSize,
    stylePreferences,
    colorPreferences,
    favoriteBrands,
    priceRange,
  } = req.body;
  if (gender) user.gender = gender;
  user.preferences = {
    shoeSize: shoeSize || user.preferences?.shoeSize,
    shirtSize: shirtSize || user.preferences?.shirtSize,
    pantsSize: pantsSize || user.preferences?.pantsSize,
    shortSize: shortSize || user.preferences?.shortSize,
    stylePreferences: stylePreferences || user.preferences?.stylePreferences,
    colorPreferences: colorPreferences || user.preferences?.colorPreferences,
    favoriteBrands: favoriteBrands || user.preferences?.favoriteBrands,
    priceRange: priceRange || user.preferences?.priceRange,
  };
  await user.save();
  res.status(200).json({ message: 'Onboarding completed successfully' });
};
// get profile
export const getProfile = async (req, res) => {
  const user = req.user;
  if (!user) throw new UnauthorizedError('Authentication required');

  res.status(200).json({
    username: user.username,
    email: user.email,
    gender: user.gender || '',
    shoeSize: user.preferences?.shoeSize || '',
    shirtSize: user.preferences?.shirtSize || '',
    shortSize: user.preferences?.shortSize || '',
    pantsSize: user.preferences?.pantsSize || '',
    stylePreferences: user.preferences?.stylePreferences || [],
    favoriteBrands: user.preferences?.favoriteBrands || [],
    colorPreferences: user.preferences?.colorPreferences || [],
    priceRange: user.preferences?.priceRange || '',
  });
};

//update profile
export const updateProfile = async (req, res) => {
  const user = req.user;
  if (!user) throw new UnauthorizedError('Authentication required');

  const {
    gender,
    shoeSize,
    shirtSize,
    shortSize,
    pantsSize,
    stylePreferences,
    favoriteBrands,
    colorPreferences,
    priceRange,
  } = req.body;

  if (gender !== undefined) user.gender = gender;

  user.preferences = {
    shoeSize: shoeSize ?? user.preferences?.shoeSize,
    shirtSize: shirtSize ?? user.preferences?.shirtSize,
    shortSize: shortSize ?? user.preferences?.shortSize,
    pantsSize: pantsSize ?? user.preferences?.pantsSize,
    stylePreferences: stylePreferences ?? user.preferences?.stylePreferences,
    favoriteBrands: favoriteBrands ?? user.preferences?.favoriteBrands,
    colorPreferences: colorPreferences ?? user.preferences?.colorPreferences,
    priceRange: priceRange ?? user.preferences?.priceRange,
  };

  await user.save();

  res.status(200).json({
    gender: user.gender,
    ...user.preferences,
  });
};
