import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Student-only protected routes
router.get('/dashboard', requireAuth, requireRole('STUDENT'), StudentController.getDashboard);
router.get('/daily-challenge', requireAuth, requireRole('STUDENT'), StudentController.getDailyChallenge);

export const studentRoutes = router;

