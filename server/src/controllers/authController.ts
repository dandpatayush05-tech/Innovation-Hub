import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generateTokens, setRefreshCookie, clearRefreshCookie } from '../services/auth';
import { AuthRequest } from '../middleware/authGuard';
import crypto from 'crypto';

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ error: { message: 'Email already in use' } });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({ name, email, passwordHash });

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);
  user.refreshTokenHash = hashToken(refreshToken);
  
  await user.save();
  setRefreshCookie(res, refreshToken);

  res.status(201).json({
    message: 'Registration successful',
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    return res.status(401).json({ error: { message: 'Invalid credentials' } });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: { message: 'Invalid credentials' } });
  }

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);
  user.refreshTokenHash = hashToken(refreshToken);
  
  await user.save();
  setRefreshCookie(res, refreshToken);

  res.json({
    message: 'Login successful',
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ error: { message: 'Unauthorized: No refresh token' } });
  }

  const user = await User.findOne({ refreshTokenHash: hashToken(refreshToken) });
  if (!user) {
    clearRefreshCookie(res);
    return res.status(401).json({ error: { message: 'Unauthorized: Invalid refresh token' } });
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.role);
  user.refreshTokenHash = hashToken(newRefreshToken);
  
  await user.save();
  setRefreshCookie(res, newRefreshToken);

  res.json({ accessToken });
};

export const logout = async (req: AuthRequest, res: Response) => {
  clearRefreshCookie(res);

  if (req.user) {
    await User.findByIdAndUpdate(req.user.id, { refreshTokenHash: null });
  }

  res.json({ message: 'Logged out successfully' });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.id);
  if (!user) {
    return res.status(404).json({ error: { message: 'User not found' } });
  }
  
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  const { name, email } = req.body;
  const updates: any = {};

  if (name) updates.name = name;
  if (email) {
    const existing = await User.findOne({ email });
    if (existing && existing.id !== req.user?.id) {
      return res.status(409).json({ error: { message: 'Email already in use' } });
    }
    updates.email = email;
  }

  const user = await User.findByIdAndUpdate(req.user?.id, updates, { new: true });
  if (!user) {
    return res.status(404).json({ error: { message: 'User not found' } });
  }

  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
};
