import { Types } from 'mongoose';
import {
  Lesson,
  ILesson,
  StudentProfile,
  StudentLessonProgress,
  IStudentLessonProgress,
} from '../models';
import { GamificationService } from './gamification.service';

export interface LessonQueryFilter {
  category?: string;
  difficulty?: string;
}

export interface EnrichedLessonSummary {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  order: number;
  xpReward: number;
  isCompleted: boolean;
  status: string;
  isLocked: boolean;
  score: number;
}

export class LessonService {
  /**
   * Fetch all published lessons with deterministic prerequisite unlocking & student progress.
   */
  static async getLessons(
    userId?: string,
    filter?: LessonQueryFilter
  ): Promise<{
    lessons: EnrichedLessonSummary[];
  }> {
    const query: Record<string, unknown> = { isPublished: true };

    if (filter?.category) query.category = filter.category;
    if (filter?.difficulty) query.difficulty = filter.difficulty;

    const lessons = await Lesson.find(query).sort({ order: 1, createdAt: 1 }).lean();

    // If unauthenticated or no student profile, return all locked except the first
    let completedLessonSet = new Set<string>();
    const progressMap = new Map<string, IStudentLessonProgress>();

    if (userId) {
      const student = await StudentProfile.findOne({ userId });
      if (student) {
        const progresses = await StudentLessonProgress.find({ studentId: student._id });
        completedLessonSet = new Set(
          progresses.filter((p) => p.isCompleted).map((p) => p.lessonId.toString())
        );
        progresses.forEach((p) => progressMap.set(p.lessonId.toString(), p));
      }
    }

    // Compute deterministic sequential unlocking:
    // Lesson 1 is always unlocked.
    // Lesson N is unlocked if Lesson N-1 is completed.
    let previousLessonCompleted = true; // Lesson 1 is unlocked

    const enrichedLessons: EnrichedLessonSummary[] = lessons.map((lesson, idx) => {
      const lessonIdStr = lesson._id.toString();
      const isCompleted = completedLessonSet.has(lessonIdStr);
      const pr = progressMap.get(lessonIdStr);

      const isLocked = idx === 0 ? false : !previousLessonCompleted;
      previousLessonCompleted = isCompleted;

      return {
        _id: lessonIdStr,
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description,
        category: lesson.category,
        difficulty: lesson.difficulty,
        order: lesson.order,
        xpReward: lesson.xpReward,
        isCompleted,
        status: pr?.status || (isCompleted ? 'COMPLETED' : isLocked ? 'LOCKED' : 'NOT_STARTED'),
        isLocked,
        score: pr?.score || 0,
      };
    });

    return { lessons: enrichedLessons };
  }

  /**
   * Retrieve single lesson detail with lock validation.
   */
  static async getLessonById(
    lessonId: string,
    userId?: string
  ): Promise<{
    lesson: ILesson;
    isCompleted: boolean;
    isLocked: boolean;
    currentStep: number;
    score: number;
  }> {
    if (!Types.ObjectId.isValid(lessonId)) {
      const err = new Error('Invalid lesson ID format');
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson || !lesson.isPublished) {
      const err = new Error('Lesson not found or unpublished');
      (err as unknown as { statusCode: number }).statusCode = 404;
      throw err;
    }

    let isCompleted = false;
    let isLocked = false;
    let currentStep = 1;
    let score = 0;

    // Prerequisite check if order > 1
    if (lesson.order > 1 && userId) {
      const student = await StudentProfile.findOne({ userId });
      if (student) {
        const previousLesson = await Lesson.findOne({
          order: lesson.order - 1,
          isPublished: true,
        });

        if (previousLesson) {
          const prevProgress = await StudentLessonProgress.findOne({
            studentId: student._id,
            lessonId: previousLesson._id,
            isCompleted: true,
          });

          if (!prevProgress) {
            isLocked = true;
          }
        }

        const myProgress = await StudentLessonProgress.findOne({
          studentId: student._id,
          lessonId: lesson._id,
        });

        if (myProgress) {
          isCompleted = myProgress.isCompleted;
          currentStep = myProgress.currentStep || 1;
          score = myProgress.score || 0;
        }
      } else {
        isLocked = true;
      }
    }

    return {
      lesson,
      isCompleted,
      isLocked,
      currentStep,
      score,
    };
  }

  /**
   * Start or resume a lesson.
   */
  static async startLesson(lessonId: string, userId: string): Promise<IStudentLessonProgress> {
    if (!Types.ObjectId.isValid(lessonId)) {
      const err = new Error('Invalid lesson ID format');
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    const student = await StudentProfile.findOne({ userId });
    if (!student) {
      const err = new Error('Student profile not found');
      (err as unknown as { statusCode: number }).statusCode = 404;
      throw err;
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson || !lesson.isPublished) {
      const err = new Error('Lesson not found or unpublished');
      (err as unknown as { statusCode: number }).statusCode = 404;
      throw err;
    }

    // Upsert lesson progress
    const progress = await StudentLessonProgress.findOneAndUpdate(
      { studentId: student._id, lessonId: lesson._id },
      {
        $setOnInsert: {
          studentId: student._id,
          lessonId: lesson._id,
          isCompleted: false,
          score: 0,
          currentStep: 1,
        },
        $set: {
          status: 'IN_PROGRESS',
        },
      },
      { upsert: true, new: true }
    );

    return progress;
  }

  /**
   * Submit an answer for a specific lesson step (multiple choice or interactive move).
   */
  static async submitStepAnswer(
    lessonId: string,
    userId: string,
    stepNumber: number,
    answer: {
      selectedAnswer?: string;
      interactiveMove?: { from: string; to: string; promotion?: string };
    }
  ): Promise<{
    isCorrect: boolean;
    explanation?: string;
    nextStep: number;
    totalSteps: number;
  }> {
    const student = await StudentProfile.findOne({ userId });
    if (!student) {
      const err = new Error('Student profile not found');
      (err as unknown as { statusCode: number }).statusCode = 404;
      throw err;
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      const err = new Error('Lesson not found');
      (err as unknown as { statusCode: number }).statusCode = 404;
      throw err;
    }

    const step = lesson.content.find((s) => s.stepNumber === stepNumber);
    if (!step) {
      const err = new Error(`Lesson step ${stepNumber} not found`);
      (err as unknown as { statusCode: number }).statusCode = 404;
      throw err;
    }

    let isCorrect = false;

    if (step.type === 'TEXT') {
      isCorrect = true;
    } else if (step.type === 'MULTIPLE_CHOICE') {
      isCorrect =
        Boolean(answer.selectedAnswer) &&
        answer.selectedAnswer?.trim().toLowerCase() === step.correctAnswer?.trim().toLowerCase();
    } else if (step.type === 'INTERACTIVE_BOARD' && step.interactiveMove) {
      const move = answer.interactiveMove;
      isCorrect =
        Boolean(move) &&
        move?.from === step.interactiveMove.from &&
        move?.to === step.interactiveMove.to;
    }

    if (isCorrect) {
      // Advance currentStep in progress
      await StudentLessonProgress.findOneAndUpdate(
        { studentId: student._id, lessonId: lesson._id },
        {
          $max: { currentStep: stepNumber + 1 },
          $set: { status: 'IN_PROGRESS' },
        },
        { upsert: true }
      );
    }

    return {
      isCorrect,
      explanation: step.explanation,
      nextStep: Math.min(stepNumber + 1, lesson.content.length),
      totalSteps: lesson.content.length,
    };
  }

  /**
   * Finalize and mark lesson as completed, awarding XP with idempotency.
   */
  static async completeLesson(
    lessonId: string,
    userId: string
  ): Promise<{
    success: boolean;
    progress: IStudentLessonProgress;
    xpAwarded: number;
    nextLessonId?: string;
  }> {
    if (!Types.ObjectId.isValid(lessonId)) {
      const err = new Error('Invalid lesson ID format');
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    const student = await StudentProfile.findOne({ userId });
    if (!student) {
      const err = new Error('Student profile not found');
      (err as unknown as { statusCode: number }).statusCode = 404;
      throw err;
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      const err = new Error('Lesson not found');
      (err as unknown as { statusCode: number }).statusCode = 404;
      throw err;
    }

    const progress = await StudentLessonProgress.findOneAndUpdate(
      { studentId: student._id, lessonId: lesson._id },
      {
        $set: {
          isCompleted: true,
          status: 'COMPLETED',
          score: 100,
          completedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    // Award XP through gamification engine (idempotent via LESSON_COMPLETION)
    const xpRes = await GamificationService.awardXp(
      student._id,
      lesson.xpReward,
      `Completed lesson: ${lesson.title}`,
      'LESSON_COMPLETION',
      lesson._id.toString()
    );

    // Increment daily practice streak
    await GamificationService.recordStudentActivity(student._id);

    // Find next sequential lesson to guide student
    const nextLesson = await Lesson.findOne({
      order: lesson.order + 1,
      isPublished: true,
    });

    return {
      success: true,
      progress,
      xpAwarded: xpRes.amountAwarded,
      nextLessonId: nextLesson ? nextLesson._id.toString() : undefined,
    };
  }
}
