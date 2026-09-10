import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign(
    { id: userId, role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY as any }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRY as any }
  );

  return { accessToken, refreshToken };
};

export const setRefreshCookie = (res: Response, refreshToken: string) => {
  // Max age is calculated based on the string e.g., '7d'
  const maxAge = 7 * 24 * 60 * 60 * 1000; 

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge
  });
};

export const clearRefreshCookie = (res: Response) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0)
  });
};
