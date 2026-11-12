import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { CookieOptions } from 'express';
import { config } from '../config/env';
import { AuthJwtPayload } from '../types/auth.types';

/**
 * Generate a signed JWT for the authenticated user.
 */
export function generateToken(payload: AuthJwtPayload): string {
  // @ts-expect-error jsonwebtoken types mismatch on SignOptions expiresIn string
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/**
 * Verify and decode an authentication JWT.
 * Throws on expiration or invalid signature.
 */
export function verifyToken(token: string): AuthJwtPayload {
  return jwt.verify(token, config.jwtSecret) as AuthJwtPayload;
}

/**
 * Generate a cryptographically secure random 8-character parent linking code.
 */
export function generateParentLinkCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

/**
 * Return secure HTTP-only cookie options.
 */
export function getAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  };
}

/**
 * Return cookie options for clearing authentication session.
 */
export function getClearCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    path: '/',
  };
}
