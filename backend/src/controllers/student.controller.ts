import { Request, Response, NextFunction } from 'express';
import {
  StudentProfile,
  DailyChallenge,
  Badge,
  StudentBadge,
  Lesson,
  StudentLessonProgress,
  XpTransaction,
} from '../models';
import { GamificationService } from '../services/gamification.service';

export class StudentController {
  /**
   * Return complete aggregated dashboard data for authenticated student.
   */
  static async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      // 1. Fetch student profile
      const student = await StudentProfile.findOne({ userId: req.user.id });
      if (!student) {
        res.status(404).json({ success: false, message: 'Student profile not found' });
        return;
      }

      // 2. Compute dynamic XP progress towards next level
      const xpProgressRaw = GamificationService.getXpProgress(student.xp);
      const xpProgress = {
        ...xpProgressRaw,
        totalXp: student.xp,
        xpRequiredForNextLevel: xpProgressRaw.xpNeededForNextLevel,
        percentage: xpProgressRaw.progressPercent,
        xpRemaining: Math.max(0, xpProgressRaw.xpNeededForNextLevel - xpProgressRaw.xpInCurrentLevel),
      };

      // 3. Fetch today's Daily Challenge
      const todayDate = new Date().toISOString().split('T')[0];
      const dailyChallenge = await DailyChallenge.findOne({ date: todayDate });

      // 4. Fetch Badges (both unlocked by student and complete catalog for locked showcase)
      const unlockedStudentBadges = await StudentBadge.find({ studentId: student._id });
      const unlockedCodes = new Set(unlockedStudentBadges.map((sb) => sb.badgeCode));

      const allBadges = await Badge.find().sort({ category: 1, name: 1 });
      const badges = allBadges.map((b) => ({
        badgeCode: b.badgeCode,
        name: b.name,
        description: b.description,
        icon: b.icon,
        category: b.category,
        isUnlocked: unlockedCodes.has(b.badgeCode),
        unlockedAt: unlockedStudentBadges.find((sb) => sb.badgeCode === b.badgeCode)?.unlockedAt || null,
      }));

      // 5. Fetch Curriculum & Student Progress
      const lessons = await Lesson.find({ isPublished: true }).sort({ order: 1 });
      const progressRecords = await StudentLessonProgress.find({ studentId: student._id });
      const completedLessonMap = new Map(
        progressRecords.map((pr) => [pr.lessonId.toString(), pr])
      );

      const learningProgress = lessons.map((l) => {
        const pr = completedLessonMap.get(l._id.toString());
        return {
          id: l._id.toString(),
          title: l.title,
          slug: l.slug,
          category: l.category,
          difficulty: l.difficulty,
          order: l.order,
          xpReward: l.xpReward,
          isCompleted: Boolean(pr?.isCompleted),
          score: pr?.score || 0,
        };
      });

      // 6. Fetch Recent Activity (from real XpTransactions)
      const recentTransactions = await XpTransaction.find({ studentId: student._id })
        .sort({ createdAt: -1 })
        .limit(10);

      const recentActivity = recentTransactions.map((tx) => ({
        id: tx._id.toString(),
        type: tx.sourceType || 'MANUAL_AWARD',
        amount: tx.amount,
        reason: tx.reason,
        createdAt: tx.createdAt,
      }));

      // 7. Assemble safe DTO
      res.status(200).json({
        success: true,
        student: {
          id: student._id.toString(),
          displayName: student.displayName,
          avatar: student.avatar,
          rating: student.chessRating,
          level: student.level,
          xp: student.xp,
          xpProgress,
          streak: {
            current: student.currentStreak,
            longest: student.longestStreak,
            lastActiveDate: student.lastActiveDate,
          },
          stats: {
            gamesPlayed: student.gamesPlayed,
            gamesWon: student.gamesWon,
            gamesLost: student.gamesLost,
            gamesDrawn: student.gamesDrawn,
            puzzlesSolved: student.puzzlesSolved,
          },
          parentLinkCode: student.parentLinkCode,
        },
        dailyChallenge: dailyChallenge
          ? {
              date: dailyChallenge.date,
              title: dailyChallenge.title,
              description: dailyChallenge.description,
              type: dailyChallenge.type,
              targetCount: dailyChallenge.targetCount,
              xpReward: dailyChallenge.xpReward,
            }
          : null,
        badges,
        learningProgress,
        recentActivity,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Return today's daily challenge.
   */
  static async getDailyChallenge(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      const challenge = await DailyChallenge.findOne({ date: todayDate });

      res.status(200).json({
        success: true,
        challenge: challenge || null,
        message: challenge ? undefined : 'No challenge today. Check back tomorrow!',
      });
    } catch (error) {
      next(error);
    }
  }
}

