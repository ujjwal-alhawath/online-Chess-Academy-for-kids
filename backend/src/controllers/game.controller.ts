import { Request, Response, NextFunction } from 'express';
import { GameService } from '../services/game.service';

export class GameController {
  /**
   * POST /api/games - Create new game
   */
  static async createGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const game = await GameService.createGame({
        userId: req.user.id,
        ...req.body,
      });

      res.status(201).json({
        success: true,
        message: 'Game created successfully',
        game,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/games/:gameId - Get game by ID
   */
  static async getGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const gameId = Array.isArray(req.params.gameId) ? req.params.gameId[0] : req.params.gameId;
      const game = await GameService.getGameById(
        gameId,
        req.user.id,
        req.user.role
      );

      res.status(200).json({
        success: true,
        game,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/games/:gameId/moves - Execute move
   */
  static async makeMove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const gameId = Array.isArray(req.params.gameId) ? req.params.gameId[0] : req.params.gameId;
      const result = await GameService.makeMove({
        gameId,
        userId: req.user.id,
        from: req.body.from,
        to: req.body.to,
        promotion: req.body.promotion,
      });

      res.status(200).json({
        success: true,
        message: 'Move executed successfully',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/games/:gameId/resign - Resign active game
   */
  static async resign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const gameId = Array.isArray(req.params.gameId) ? req.params.gameId[0] : req.params.gameId;
      const game = await GameService.resignGame(gameId, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Game resigned',
        game,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/games/history - Get student's game history
   */
  static async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;

      const history = await GameService.getGameHistory(req.user.id, page, limit);

      res.status(200).json({
        success: true,
        ...history,
      });
    } catch (error) {
      next(error);
    }
  }
}
