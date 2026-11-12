import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { verifyToken } from '../utils/jwt';
import { User } from '../models';

/**
 * Middleware ensuring the request contains a valid authenticated session.
 * Reads token from secure HTTP-only cookie (or Bearer Authorization fallback).
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined = req.cookies?.[config.cookieName];

    // Fallback: manually parse cookie header if cookieParser was bypassed or on proxy
    if (!token && req.headers.cookie) {
      const match = req.headers.cookie.match(new RegExp(`(?:^|; )${config.cookieName}=([^;]*)`));
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    // Fallback: Authorization header (useful for programmatic API consumers/testing)
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
      return;
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.',
      });
      return;
    }

    // Verify user exists in database and is active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User account not found or deactivated.',
      });
      return;
    }

    // Attach verified user info to request
    req.user = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

