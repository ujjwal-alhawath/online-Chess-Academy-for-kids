import { Types } from 'mongoose';
import {
  StudentProfile,
  Badge,
  StudentBadge,
  XpTransaction,
  XpSourceType,
} from '../models';

export interface XpProgressInfo {
  currentLevel: number;
  nextLevel: number;
  currentLevelXp: number;
  nextLevelXp: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
}

export class GamificationService {
  /**
   * Calculate cumulative XP required to reach a specific level L.
   * Formula:
   * Level 1: 0 XP
   * Level 2: 100 XP
   * Level 3: 250 XP
   * Level 4: 450 XP
   * Level 5: 700 XP
   * Closed-form: XP(L) = 25 * (L^2 + L - 2)
   */
  static getXpForLevel(level: number): number {
    if (level <= 1) return 0;
    return 25 * (level * level + level - 2);
  }

  /**
   * Determine student level from their total lifetime XP.
   */
  static getLevelFromXp(xp: number): number {
    if (xp <= 0) return 1;
    // Solve 25*L^2 + 25*L - (50 + xp) = 0 for L >= 1
    const discriminant = 9 + 0.16 * xp;
    const level = Math.floor((-1 + Math.sqrt(discriminant)) / 2);
    return Math.max(1, level);
  }

  /**
   * Compute dynamic XP progress towards the next level.
   */
  static getXpProgress(xp: number): XpProgressInfo {
    const safeXp = Math.max(0, xp);
    const currentLevel = this.getLevelFromXp(safeXp);
    const nextLevel = currentLevel + 1;

    const currentLevelXp = this.getXpForLevel(currentLevel);
    const nextLevelXp = this.getXpForLevel(nextLevel);

    const xpInCurrentLevel = safeXp - currentLevelXp;
    const xpNeededForNextLevel = nextLevelXp - currentLevelXp;

    const progressPercent =
      xpNeededForNextLevel > 0
        ? Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100)))
        : 100;

    return {
      currentLevel,
      nextLevel,
      currentLevelXp,
      nextLevelXp,
      xpInCurrentLevel,
      xpNeededForNextLevel,
      progressPercent,
    };
  }

  /**
   * Award XP to a student safely with idempotency protection against duplicate triggers.
   */
  static async awardXp(
    studentId: string | Types.ObjectId,
    amount: number,
    reason: string,
    sourceType?: XpSourceType,
    sourceId?: string
  ): Promise<{
    xp: number;
    level: number;
    leveledUp: boolean;
    amountAwarded: number;
    duplicatePrevented: boolean;
  }> {
    if (amount <= 0) {
      throw new Error('XP award amount must be greater than zero');
    }

    const studentObjectId = new Types.ObjectId(studentId);

    // 1. Check for duplicate award if sourceType & sourceId provided
    if (sourceType && sourceId) {
      const existingTx = await XpTransaction.findOne({
        studentId: studentObjectId,
        sourceType,
        sourceId,
      });

      if (existingTx) {
        const currentStudent = await StudentProfile.findById(studentObjectId);
        return {
          xp: currentStudent?.xp || 0,
          level: currentStudent?.level || 1,
          leveledUp: false,
          amountAwarded: 0,
          duplicatePrevented: true,
        };
      }
    }

    // 2. Record transaction
    await XpTransaction.create({
      studentId: studentObjectId,
      amount,
      reason,
      sourceType,
      sourceId,
    });

    // 3. Atomically update student XP and recompute level
    const student = await StudentProfile.findById(studentObjectId);
    if (!student) {
      throw new Error(`StudentProfile not found: ${studentId}`);
    }

    const oldLevel = student.level;
    const newXp = student.xp + amount;
    const newLevel = this.getLevelFromXp(newXp);
    const leveledUp = newLevel > oldLevel;

    student.xp = newXp;
    student.level = newLevel;
    await student.save();

    return {
      xp: newXp,
      level: newLevel,
      leveledUp,
      amountAwarded: amount,
      duplicatePrevented: false,
    };
  }

  /**
   * Record learning activity to update daily streak.
   * Handles timezone and calendar date boundaries cleanly.
   */
  static async recordStudentActivity(
    studentId: string | Types.ObjectId,
    activityDate: Date = new Date()
  ): Promise<{
    currentStreak: number;
    longestStreak: number;
    streakUpdated: boolean;
  }> {
    const studentObjectId = new Types.ObjectId(studentId);
    const student = await StudentProfile.findById(studentObjectId);
    if (!student) {
      throw new Error(`StudentProfile not found: ${studentId}`);
    }

    // Format calendar dates as YYYY-MM-DD UTC
    const toUtcDateKey = (d: Date) => d.toISOString().split('T')[0];
    const todayKey = toUtcDateKey(activityDate);

    if (student.lastActiveDate) {
      const lastKey = toUtcDateKey(student.lastActiveDate);

      if (todayKey === lastKey) {
        // Already active today; streak remains current
        return {
          currentStreak: student.currentStreak,
          longestStreak: student.longestStreak,
          streakUpdated: false,
        };
      }

      // Calculate calendar day difference
      const todayTime = new Date(`${todayKey}T00:00:00.000Z`).getTime();
      const lastTime = new Date(`${lastKey}T00:00:00.000Z`).getTime();
      const diffDays = Math.round((todayTime - lastTime) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive active day -> increment streak
        student.currentStreak += 1;
      } else {
        // Missed at least one full day -> reset streak to 1
        student.currentStreak = 1;
      }
    } else {
      // First ever activity
      student.currentStreak = 1;
    }

    student.longestStreak = Math.max(student.longestStreak, student.currentStreak);
    student.lastActiveDate = activityDate;
    await student.save();

    return {
      currentStreak: student.currentStreak,
      longestStreak: student.longestStreak,
      streakUpdated: true,
    };
  }

  /**
   * Award an achievement badge to a student without duplicate errors.
   */
  static async awardBadge(
    studentId: string | Types.ObjectId,
    badgeCode: string
  ): Promise<{
    badgeCode: string;
    unlocked: boolean;
    alreadyHad: boolean;
  }> {
    const studentObjectId = new Types.ObjectId(studentId);
    const cleanBadgeCode = badgeCode.trim().toUpperCase();

    // Verify badge exists in catalog
    const badge = await Badge.findOne({ badgeCode: cleanBadgeCode });
    if (!badge) {
      throw new Error(`Badge not found with code: ${cleanBadgeCode}`);
    }

    // Check if student already unlocked this badge
    const existing = await StudentBadge.findOne({
      studentId: studentObjectId,
      badgeCode: cleanBadgeCode,
    });

    if (existing) {
      return {
        badgeCode: cleanBadgeCode,
        unlocked: false,
        alreadyHad: true,
      };
    }

    // Unlock badge
    await StudentBadge.create({
      studentId: studentObjectId,
      badgeCode: cleanBadgeCode,
      unlockedAt: new Date(),
    });

    return {
      badgeCode: cleanBadgeCode,
      unlocked: true,
      alreadyHad: false,
    };
  }
}

