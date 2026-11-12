import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || (nodeEnv === 'development' ? 'dev_jwt_secret_phase3_default_key' : '');

// Refuse to start in production if JWT_SECRET is missing or insecure
if (nodeEnv === 'production') {
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('FATAL: JWT_SECRET must be set and at least 32 characters in production');
  }
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chess_academy',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  jwtSecret: jwtSecret || 'dev_jwt_secret_phase3_default_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: process.env.COOKIE_NAME || 'chess_academy_token',
};
