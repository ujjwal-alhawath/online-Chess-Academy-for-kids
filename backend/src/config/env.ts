import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const fallbackSecret = 'prod_jwt_secret_fallback_key_at_least_32_chars_long_2026';

let jwtSecret = process.env.JWT_SECRET || (nodeEnv === 'development' ? 'dev_jwt_secret_phase3_default_key' : '');

if (nodeEnv === 'production') {
  if (!jwtSecret || jwtSecret.length < 32) {
    console.warn(
      '[Security Warning] JWT_SECRET environment variable is missing or under 32 characters in production. Using temporary fallback secret. Please configure JWT_SECRET in Vercel Environment Variables.'
    );
    jwtSecret = fallbackSecret;
  }
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chess_academy',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  jwtSecret: jwtSecret || fallbackSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: process.env.COOKIE_NAME || 'chess_academy_token',
};
