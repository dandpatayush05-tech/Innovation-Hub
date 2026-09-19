import { Response, NextFunction } from 'express';
import { AuthRequest } from './authGuard';

export const requireRole = (allowedRoles: string | string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: { message: 'Unauthorized: No user found' } });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: { message: 'Forbidden: Insufficient privileges' } });
    }
    
    next();
  };
};

/**
 * Helper to check if a user owns a resource or is an admin.
 * @param reqUser - The user object from req.user
 * @param resourceOwnerId - The ID of the user who owns the resource
 * @returns boolean
 */
export const isOwnerOrAdmin = (reqUser: { id: string, role: string }, resourceOwnerId: string): boolean => {
  return reqUser.role === 'admin' || reqUser.id === resourceOwnerId;
};

/**
 * Middleware version of ownership check if resource ID is passed in params and matches req.user.id
 */
export const requireOwnershipOrAdmin = (paramKey = 'id') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: { message: 'Unauthorized' } });
    }
    
    const resourceId = req.params[paramKey];
    if (req.user.role !== 'admin' && req.user.id !== resourceId) {
      return res.status(403).json({ error: { message: 'Forbidden: You do not own this resource' } });
    }
    next();
  };
};
