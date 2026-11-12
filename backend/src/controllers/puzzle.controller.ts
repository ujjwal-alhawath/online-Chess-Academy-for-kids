import { Request, Response, NextFunction } from 'express';
import { PuzzleService } from '../services/puzzle.service';

export class PuzzleController {
  /**
   * GET /api/puzzles - List published puzzles without solutions
   */
  static async getPuzzles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
      const theme = req.query.theme ? String(req.query.theme) : undefined;
      const minDifficulty = req.query.minDifficulty
        ? parseInt(String(req.query.minDifficulty), 10)
        : undefined;
      const maxDifficulty = req.query.maxDifficulty
        ? parseInt(String(req.query.maxDifficulty), 10)
        : undefined;
      const lessonId = req.query.lessonId ? String(req.query.lessonId) : undefined;

      const result = await PuzzleService.getPuzzles(
        { theme, minDifficulty, maxDifficulty, lessonId, page, limit },
        req.user?.role
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/puzzles/:puzzleId - Get single puzzle without solution
   */
  static async getPuzzle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const puzzleId = Array.isArray(req.params.puzzleId) ? req.params.puzzleId[0] : req.params.puzzleId;
      const puzzle = await PuzzleService.getPuzzleById(puzzleId, req.user?.role);

      res.status(200).json({
        success: true,
        puzzle,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/puzzles/:puzzleId/start - Initialize student attempt
   */
  static async startAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const puzzleId = Array.isArray(req.params.puzzleId) ? req.params.puzzleId[0] : req.params.puzzleId;
      const attemptData = await PuzzleService.startAttempt(puzzleId, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Puzzle attempt started',
        ...attemptData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/puzzles/attempts/:attemptId/move - Submit move for evaluation
   */
  static async submitMove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const attemptId = Array.isArray(req.params.attemptId) ? req.params.attemptId[0] : req.params.attemptId;
      const result = await PuzzleService.submitMove(attemptId, req.user.id, {
        from: req.body.from,
        to: req.body.to,
        promotion: req.body.promotion,
      });

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/puzzles/attempts/:attemptId/hint - Request progressive hint
   */
  static async useHint(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const attemptId = Array.isArray(req.params.attemptId) ? req.params.attemptId[0] : req.params.attemptId;
      const result = await PuzzleService.useHint(attemptId, req.user.id);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/puzzles/my-attempts - Get student's past puzzle attempts
   */
  static async getMyAttempts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;

      const result = await PuzzleService.getMyAttempts(req.user.id, page, limit);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}
