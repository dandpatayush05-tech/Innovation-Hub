import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase';
import { generateTokens, setRefreshCookie, clearRefreshCookie } from '../services/auth';
import { AuthRequest } from '../middleware/authGuard';
import crypto from 'crypto';

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).single();
  if (existingUser) {
    return res.status(409).json({ error: { message: 'Email already in use' } });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const { data: user, error } = await supabase
    .from('users')
    .insert({ name, email, password_hash: passwordHash, role: 'traveler' })
    .select()
    .single();

  if (error || !user) {
    return res.status(500).json({ error: { message: 'Failed to create user' } });
  }

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);
  
  await supabase
    .from('users')
    .update({ refresh_token_hash: hashToken(refreshToken) })
    .eq('id', user.id);

  setRefreshCookie(res, refreshToken);

  res.status(201).json({
    message: 'Registration successful',
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
  
  if (!user) {
    return res.status(401).json({ error: { message: 'Invalid credentials' } });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: { message: 'Invalid credentials' } });
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
    return res.status(401).json({ error: { message: 'Unauthorized: No refresh token' } });
  }

  const hashedToken = hashToken(refreshToken);
  const { data: user } = await supabase.from('users').select('*').eq('refresh_token_hash', hashedToken).single();
  
  if (!user) {
    clearRefreshCookie(res);
    return res.status(401).json({ error: { message: 'Unauthorized: Invalid refresh token' } });
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
    return res.status(404).json({ error: { message: 'User not found' } });
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
      return res.status(409).json({ error: { message: 'Email already in use' } });
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
    return res.status(404).json({ error: { message: 'User not found' } });
  }

  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
};
