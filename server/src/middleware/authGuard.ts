import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authGuard = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token = '';
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: { message: 'Unauthorized: No token provided' } });
  }
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { id: string; role: string };
    req.user = decoded;
    next();
  } catch (_error) {
    console.error(_error);
    return res.status(401).json({ error: { message: 'Unauthorized: Invalid or expired token' } });
  }
};

