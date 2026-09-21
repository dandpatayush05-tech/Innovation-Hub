import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase';
import { generateTokens, setRefreshCookie, clearRefreshCookie } from '../services/auth';
import { AuthRequest } from '../middleware/authGuard';
import crypto from 'crypto';
import { ApiError, UnauthorizedError, NotFoundError, ConflictError } from '../utils/ApiError';

import { signupSchema, loginSchema, changePasswordSchema, resetPasswordSchema } from '../validators/authValidator';
import { isPasswordReused, recordPasswordHistory } from '../services/passwordHistoryService';
import { checkPasswordStrength } from '../utils/passwordStrength';

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export const register = async (req: Request, res: Response): Promise<any> => {
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Validation failed', details: result.error.errors } });
  }
  const { name, email, password } = result.data;

  const strength = checkPasswordStrength(password, { name, email });
  if (!strength.ok) {
    return res.status(400).json({ error: { message: 'Password is too weak', details: strength.reasons } });
  }

  const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).single();
  if (existingUser) {
    throw new ConflictError('Email already in use', undefined);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const { data: user, error } = await supabase
    .from('users')
    .insert({ name, email, password_hash: passwordHash, role: 'traveler' })
    .select()
    .single();

  if (error || !user) {
    throw new ApiError(500, 'Failed to create user', 'INTERNAL_ERROR', undefined);
  }

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);
  
  await supabase
    .from('users')
    .update({ refresh_token_hash: hashToken(refreshToken) })
    .eq('id', user.id);

  setRefreshCookie(res, refreshToken);

  await recordPasswordHistory(user.id, passwordHash);

  res.status(201).json({
    message: 'Registration successful',
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
};

export const login = async (req: Request, res: Response): Promise<any> => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Validation failed', details: result.error.errors } });
  }
  const { email, password } = result.data;

  const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
  
  if (!user) {
    throw new UnauthorizedError('Invalid credentials', undefined);
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials', undefined);
  }

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);
  
  await supabase
    .from('users')
    .update({ refresh_token_hash: hashToken(refreshToken) })
    .eq('id', user.id);

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
    throw new UnauthorizedError('Unauthorized: No refresh token', undefined);
  }

  const hashedToken = hashToken(refreshToken);
  const { data: user } = await supabase.from('users').select('*').eq('refresh_token_hash', hashedToken).single();
  
  if (!user) {
    clearRefreshCookie(res);
    throw new UnauthorizedError('Unauthorized: Invalid refresh token', undefined);
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.role);
  
  await supabase
    .from('users')
    .update({ refresh_token_hash: hashToken(newRefreshToken) })
    .eq('id', user.id);

  setRefreshCookie(res, newRefreshToken);

  res.json({ accessToken });
};

export const logout = async (req: AuthRequest, res: Response) => {
  clearRefreshCookie(res);

  if (req.user) {
    await supabase.from('users').update({ refresh_token_hash: null }).eq('id', req.user.id);
  }

  res.json({ message: 'Logged out successfully' });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  const { data: user } = await supabase.from('users').select('*').eq('id', req.user?.id).single();
  
  if (!user) {
    throw new NotFoundError('User not found', undefined);
  }
  
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  const { name, email } = req.body;
  const updates: Record<string, unknown> = {};

  if (name) updates.name = name;
  if (email) {
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
    if (existing && existing.id !== req.user?.id) {
      throw new ConflictError('Email already in use', undefined);
    }
    updates.email = email;
  }

  const { data: user, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', req.user?.id)
    .select()
    .single();

  if (error || !user) {
    throw new NotFoundError('User not found', undefined);
  }

  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<any> => {
  const result = changePasswordSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Validation failed', details: result.error.errors } });
  }

  const { currentPassword, newPassword } = result.data;
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError('Unauthorized', undefined);
  }

  const { data: user } = await supabase.from('users').select('name, email, password_hash').eq('id', userId).single();
  
  if (!user) {
    throw new NotFoundError('User not found', undefined);
  }

  const strength = checkPasswordStrength(newPassword, { name: user.name, email: user.email });
  if (!strength.ok) {
    return res.status(400).json({ error: { message: 'Password is too weak', details: strength.reasons } });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    return res.status(400).json({ error: { message: 'Incorrect current password' } });
  }

  const reused = await isPasswordReused(userId, newPassword);
  if (reused) {
    return res.status(400).json({ error: { message: 'Cannot reuse one of your last 5 passwords' } });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await supabase.from('users').update({ password_hash: passwordHash }).eq('id', userId);
  await recordPasswordHistory(userId, passwordHash);

  res.json({ message: 'Password changed successfully' });
};

export const resetPassword = async (req: Request, res: Response): Promise<any> => {
  const result = resetPasswordSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: { message: 'Validation failed', details: result.error.errors } });
  }

  const { email, newPassword } = result.data;

  const { data: user } = await supabase.from('users').select('id, name, email').eq('email', email).single();
  
  if (!user) {
    // Return generic message to prevent email enumeration
    return res.json({ message: 'If the email exists, the password has been reset.' });
  }

  const strength = checkPasswordStrength(newPassword, { name: user.name, email: user.email });
  if (!strength.ok) {
    return res.status(400).json({ error: { message: 'Password is too weak', details: strength.reasons } });
  }

  const reused = await isPasswordReused(user.id, newPassword);
  if (reused) {
    return res.status(400).json({ error: { message: 'Cannot reuse one of your last 5 passwords' } });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await supabase.from('users').update({ password_hash: passwordHash }).eq('id', user.id);
  await recordPasswordHistory(user.id, passwordHash);

  res.json({ message: 'If the email exists, the password has been reset.' });
};
