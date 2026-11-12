import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createGameSchema, makeMoveSchema } from '../schemas/game.schemas';
import { GameController } from '../controllers/game.controller';

const router = Router();

// 1. Create a new game
router.post('/', requireAuth, validateRequest(createGameSchema), GameController.createGame);

// 2. Fetch authenticated user's game history (placed before /:gameId so 'history' is not matched as an id)
router.get('/history', requireAuth, GameController.getHistory);

// 3. Fetch specific game by ID
router.get('/:gameId', requireAuth, GameController.getGame);

// 4. Submit an authoritative move
router.post(
  '/:gameId/moves',
  requireAuth,
  validateRequest(makeMoveSchema),
  GameController.makeMove
);

// 5. Resign an active game
router.post('/:gameId/resign', requireAuth, GameController.resign);

export const gameRoutes = router;

