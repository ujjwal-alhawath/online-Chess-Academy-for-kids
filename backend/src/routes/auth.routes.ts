import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  registerSchema,
  loginSchema,
  linkParentSchema,
} from '../schemas/auth.schemas';

const router = Router();

// Rate limiter for authentication endpoints (prevent brute-force abuse)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Reasonable threshold for dev & automated testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again in 15 minutes.',
  },
});

// Public Authentication Routes
router.post(
  '/register',
  authLimiter,
  validateRequest(registerSchema),
  AuthController.register
);

router.post(
  '/login',
  authLimiter,
  validateRequest(loginSchema),
  AuthController.login
);

router.post('/logout', AuthController.logout);

// Protected Authentication Routes
router.get('/me', requireAuth, AuthController.me);

router.post(
  '/link-parent',
  requireAuth,
  requireRole('PARENT'),
  validateRequest(linkParentSchema),
  AuthController.linkParent
);

export const authRoutes = router;

