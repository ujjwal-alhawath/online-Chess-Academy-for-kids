import { Request, Response, NextFunction } from 'express';
import { LessonService } from '../services/lesson.service';

export class LessonController {
  /**
   * GET /api/lessons - Fetch published lessons with unlocking status
   */
  static async getLessons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.query.category ? String(req.query.category) : undefined;
      const difficulty = req.query.difficulty ? String(req.query.difficulty) : undefined;

      const result = await LessonService.getLessons(req.user?.id, { category, difficulty });

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/lessons/:lessonId - Fetch single lesson detail
   */
  static async getLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lessonId = Array.isArray(req.params.lessonId) ? req.params.lessonId[0] : req.params.lessonId;
      const result = await LessonService.getLessonById(lessonId, req.user?.id);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/lessons/:lessonId/start - Start or resume a lesson
   */
  static async startLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const lessonId = Array.isArray(req.params.lessonId) ? req.params.lessonId[0] : req.params.lessonId;
      const progress = await LessonService.startLesson(lessonId, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Lesson started',
        progress,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/lessons/:lessonId/steps/:stepNumber - Submit answer for a step
   */
  static async submitStep(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const lessonId = Array.isArray(req.params.lessonId) ? req.params.lessonId[0] : req.params.lessonId;
      const stepNumber = parseInt(
        Array.isArray(req.params.stepNumber) ? req.params.stepNumber[0] : req.params.stepNumber,
        10
      );

      const result = await LessonService.submitStepAnswer(lessonId, req.user.id, stepNumber, {
        selectedAnswer: req.body.selectedAnswer,
        interactiveMove: req.body.interactiveMove,
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
   * POST /api/lessons/:lessonId/complete - Complete lesson & award XP
   */
  static async completeLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const lessonId = Array.isArray(req.params.lessonId) ? req.params.lessonId[0] : req.params.lessonId;
      const result = await LessonService.completeLesson(lessonId, req.user.id);

      res.status(200).json({
        message: 'Lesson completed successfully',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}
