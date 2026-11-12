import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { puzzleMoveSchema } from '../schemas/puzzle.schemas';
import { PuzzleController } from '../controllers/puzzle.controller';

const router = Router();

// 1. List published puzzles
router.get('/', PuzzleController.getPuzzles);

// 2. Fetch authenticated student's puzzle attempts (placed before /:puzzleId)
router.get('/my-attempts', requireAuth, PuzzleController.getMyAttempts);

// 3. Fetch single puzzle detail
router.get('/:puzzleId', PuzzleController.getPuzzle);

// 4. Initialize puzzle attempt
router.post('/:puzzleId/start', requireAuth, PuzzleController.startAttempt);

// 5. Submit move for authoritative solution check
router.post(
  '/attempts/:attemptId/move',
  requireAuth,
  validateRequest(puzzleMoveSchema),
  PuzzleController.submitMove
);

// 6. Request progressive hint
router.post('/attempts/:attemptId/hint', requireAuth, PuzzleController.useHint);

export const puzzleRoutes = router;

