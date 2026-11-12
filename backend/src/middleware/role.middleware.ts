import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models';

/**
 * Role-Based Access Control (RBAC) middleware.
 * Verifies that the authenticated user possesses one of the allowed roles.
 * Must be mounted AFTER requireAuth middleware.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required before role check.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access forbidden: Requires one of [${allowedRoles.join(', ')}] role.`,
      });
      return;
    }

    next();
  };
}

