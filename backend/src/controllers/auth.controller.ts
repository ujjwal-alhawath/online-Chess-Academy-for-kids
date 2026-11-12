import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { getAuthCookieOptions, getClearCookieOptions } from '../utils/jwt';
import { config } from '../config/env';

export class AuthController {
  /**
   * Register a new user and set authentication cookie.
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, profile, token } = await AuthService.register(req.body);

      // Set secure HTTP-only cookie
      res.cookie(config.cookieName, token, getAuthCookieOptions());

      res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        user,
        profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Log in user and set authentication cookie.
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, profile, token } = await AuthService.login(req.body);

      // Set secure HTTP-only cookie
      res.cookie(config.cookieName, token, getAuthCookieOptions());

      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        user,
        profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Log out user and clear authentication cookie.
   */
  static async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie(config.cookieName, getClearCookieOptions());

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current authenticated user session & profile.
   */
  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
        return;
      }

      const { user, profile } = await AuthService.getCurrentUser(req.user.id);

      res.status(200).json({
        success: true,
        user,
        profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Link parent account to student account via parentLinkCode.
   */
  static async linkParent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const result = await AuthService.linkParent(req.user.id, req.body.parentLinkCode);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}
