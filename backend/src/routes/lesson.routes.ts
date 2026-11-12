import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { lessonStepAnswerSchema } from '../schemas/lesson.schemas';
import { LessonController } from '../controllers/lesson.controller';

const router = Router();

// 1. Fetch published curriculum with unlocking state
router.get('/', LessonController.getLessons);

// 2. Fetch single lesson detail
router.get('/:lessonId', LessonController.getLesson);

// 3. Start or resume a lesson
router.post('/:lessonId/start', requireAuth, LessonController.startLesson);

// 4. Submit answer for a lesson step
router.post(
  '/:lessonId/steps/:stepNumber',
  requireAuth,
  validateRequest(lessonStepAnswerSchema),
  LessonController.submitStep
);

// 5. Complete lesson and claim XP
router.post('/:lessonId/complete', requireAuth, LessonController.completeLesson);

export const lessonRoutes = router;
