import { Types } from 'mongoose';
import { Chess } from 'chess.js';
import {
  Puzzle,
  IPuzzle,
  PuzzleAttempt,
  IPuzzleAttempt,
  StudentProfile,
  DailyChallenge,
} from '../models';
import { GamificationService } from './gamification.service';

export interface PuzzleQueryFilter {
  theme?: string;
  minDifficulty?: number;
  maxDifficulty?: number;
  lessonId?: string;
  page?: number;
  limit?: number;
}

export class PuzzleService {
  /**
   * Fetch paginated published puzzles WITHOUT leaking solutionMoves.
   */
  static async getPuzzles(
    filter: PuzzleQueryFilter,
    userRole?: string
  ): Promise<{
    puzzles: Partial<IPuzzle>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    // Only Admins can see unpublished drafts
    if (userRole !== 'ADMIN') {
      query.isPublished = true;
    }

    if (filter.theme) {
      query.theme = filter.theme;
    }

    if (filter.minDifficulty !== undefined || filter.maxDifficulty !== undefined) {
      query.difficulty = {};
      if (filter.minDifficulty !== undefined) {
        (query.difficulty as Record<string, number>).$gte = filter.minDifficulty;
      }
      if (filter.maxDifficulty !== undefined) {
        (query.difficulty as Record<string, number>).$lte = filter.maxDifficulty;
      }
    }

    if (filter.lessonId && Types.ObjectId.isValid(filter.lessonId)) {
      query.lessonId = new Types.ObjectId(filter.lessonId);
    }

    const [puzzles, total] = await Promise.all([
      Puzzle.find(query)
        .select('-solutionMoves') // SECURITY: Never leak solutionMoves in list endpoint
        .sort({ difficulty: 1, order: 1, createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean() as unknown as Promise<Partial<IPuzzle>[]>,
      Puzzle.countDocuments(query),
    ]);

    return {
      puzzles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Fetch a single puzzle WITHOUT leaking solutionMoves.
   */
  static async getPuzzleById(puzzleId: string, userRole?: string): Promise<Partial<IPuzzle>> {
    if (!Types.ObjectId.isValid(puzzleId)) {
      const err = new Error('Invalid puzzle ID format');
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    const puzzle = (await Puzzle.findById(puzzleId)
      .select('-solutionMoves')
      .lean()) as unknown as Partial<IPuzzle>;

    if (!puzzle) {
      const err = new Error('Puzzle not found');
      (err as unknown as { statusCode: number }).statusCode = 404;
      throw err;
    }

    if (!puzzle.isPublished && userRole !== 'ADMIN') {
      const err = new Error('Puzzle is not currently published');
      (err as unknown as { statusCode: number }).statusCode = 403;
      throw err;
    }

    return puzzle;
  }

  /**
   * Initialize a new attempt for a student WITHOUT returning solutionMoves.
   */
  static async startAttempt(
    puzzleId: string,
    userId: string
  ): Promise<{
    attemptId: string;
    puzzle: {
      id: string;
      title: string;
      theme: string;
      difficulty: number;
      hint: string;
      hints?: string[];
      xpReward: number;
      fen: string;
    };
    currentFen: string;
    currentMoveIndex: number;
  }> {
    if (!Types.ObjectId.isValid(puzzleId)) {
      const err = new Error('Invalid puzzle ID format');
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    const puzzle = await Puzzle.findById(puzzleId);
    if (!puzzle || !puzzle.isPublished) {
      const err = new Error('Puzzle not found or unpublished');
      (err as unknown as { statusCode: number }).statusCode = 404;
      throw err;
    }

    const student = await StudentProfile.findOne({ userId });
    if (!student) {
      const err = new Error('Student profile not found');
      (err as unknown as { statusCode: number }).statusCode = 404;
      throw err;
    }

    // Count previous attempts to record attempt sequence
    const previousAttempts = await PuzzleAttempt.countDocuments({
      studentId: student._id,
      puzzleId: puzzle._id,
    });

    const attempt = await PuzzleAttempt.create({
      studentId: student._id,
      puzzleId: puzzle._id,
      status: 'IN_PROGRESS',
      solved: false,
      currentFen: puzzle.fen,
      currentMoveIndex: 0,
      attemptsCount: previousAttempts + 1,
      mistakes: 0,
      hintsUsed: 0,
      score: 0,
      submittedMoves: [],
    });

    return {
      attemptId: attempt._id.toString(),
      puzzle: {
        id: puzzle._id.toString(),
        title: puzzle.title,
        theme: puzzle.theme,
        difficulty: puzzle.difficulty,
        hint: puzzle.hint,
        hints: puzzle.hints,
        xpReward: puzzle.xpReward,
        fen: puzzle.fen,
      },
      currentFen: attempt.currentFen,
      currentMoveIndex: attempt.currentMoveIndex,
    };
  }

  /**
   * Authoritative server-side move evaluation against the hidden solution sequence.
   */
  static async submitMove(
    attemptId: string,
    userId: string,
    move: { from: string; to: string; promotion?: 'q' | 'r' | 'b' | 'n' }
  ): Promise<{
    correct: boolean;
    gameOver: boolean;
    feedback: string;
    fen: string;
    moveNumber: number;
    mistakes: number;
    score?: number;
    xpAwarded?: number;
    opponentMove?: {
      from: string;
      to: string;
      san: string;
    };
  }> {
    if (!Types.ObjectId.isValid(attemptId)) {
      const err = new Error('Invalid attempt ID format');
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    const student = await StudentProfile.findOne({ userId });
    if (!student) {
      const err = new Error('Student profile not found');
      (err as unknown as { statusCode: number }).statusCode = 404;
      throw err;
    }

    const attempt = await PuzzleAttempt.findById(attemptId);
    if (!attempt) {
      const err = new Error('Puzzle attempt not found');
      (err as unknown as { statusCode: number }).statusCode = 404;
      throw err;
    }

    // Security check: Only the owning student can submit moves
    if (!attempt.studentId.equals(student._id)) {
      const err = new Error('Access denied: You do not own this puzzle attempt');
      (err as unknown as { statusCode: number }).statusCode = 403;
      throw err;
    }

    if (attempt.status !== 'IN_PROGRESS') {
      const err = new Error(`Attempt is already closed with status: ${attempt.status}`);
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    const puzzle = await Puzzle.findById(attempt.puzzleId);
    if (!puzzle) {
      const err = new Error('Associated puzzle not found');
      (err as unknown as { statusCode: number }).statusCode = 404;
      throw err;
    }

    // 1. Reconstruct current chess position
    const chess = new Chess(attempt.currentFen);

    // 2. Validate move legality with chess.js
    let userMove;
    try {
      userMove = chess.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      });
    } catch {
      const err = new Error(`Illegal chess move from ${move.from} to ${move.to}`);
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    if (!userMove) {
      const err = new Error(`Illegal chess move from ${move.from} to ${move.to}`);
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    // 3. Compare with expected move at currentMoveIndex
    const expectedMoveStr = puzzle.solutionMoves[attempt.currentMoveIndex];
    if (!expectedMoveStr) {
      const err = new Error('No further solution moves defined');
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    // Flexible match against SAN (e.g. 'Nxc7+') or LAN/coordinates (e.g. 'd5c7')
    const userLan = `${userMove.from}${userMove.to}${userMove.promotion || ''}`;
    const cleanExpected = expectedMoveStr.replace(/[+#x=]/g, '');

    const isMatch =
      userMove.san === expectedMoveStr ||
      userLan === expectedMoveStr ||
      userLan === cleanExpected;

    // 4. Incorrect move handling
    if (!isMatch) {
      attempt.mistakes += 1;
      attempt.submittedMoves.push(userMove.san);
      await attempt.save();

      return {
        correct: false,
        gameOver: false,
        feedback: 'Good try! Look for a sharper tactical move.',
        fen: attempt.currentFen, // Position remains unchanged on mistake
        moveNumber: attempt.currentMoveIndex + 1,
        mistakes: attempt.mistakes,
      };
    }

    // 5. Correct move handling
    attempt.submittedMoves.push(userMove.san);
    attempt.currentFen = chess.fen();
    attempt.currentMoveIndex += 1;

    // Check if there is a scripted opponent reply
    if (attempt.currentMoveIndex < puzzle.solutionMoves.length) {
      // Execute opponent response move
      const opponentExpected = puzzle.solutionMoves[attempt.currentMoveIndex];
      let oppMove;
      try {
        oppMove = chess.move(opponentExpected);
      } catch {
        // Fallback for coordinate formatted opponent moves
        const from = opponentExpected.substring(0, 2);
        const to = opponentExpected.substring(2, 4);
        const promo = opponentExpected.length > 4 ? opponentExpected.charAt(4) : undefined;
        oppMove = chess.move({ from, to, promotion: promo });
      }

      if (oppMove) {
        attempt.currentFen = chess.fen();
        attempt.currentMoveIndex += 1;
        attempt.submittedMoves.push(oppMove.san);
        await attempt.save();

        return {
          correct: true,
          gameOver: false,
          feedback: 'Great move! Opponent responded.',
          fen: attempt.currentFen,
          moveNumber: attempt.currentMoveIndex,
          mistakes: attempt.mistakes,
          opponentMove: {
            from: oppMove.from,
            to: oppMove.to,
            san: oppMove.san,
          },
        };
      }
    }

    // 6. Final move completed -> Complete Puzzle Attempt!
    attempt.status = 'COMPLETED';
    attempt.solved = true;
    attempt.completedAt = new Date();

    // Transparent scoring formula: 100 - mistakes*20 - hints*10 (min 40)
    const finalScore = Math.max(40, 100 - attempt.mistakes * 20 - attempt.hintsUsed * 10);
    attempt.score = finalScore;
    await attempt.save();

    // 7. Gamification & First-Solve Idempotency
    // Check if this student has ever solved this puzzle before
    const priorSolvedCount = await PuzzleAttempt.countDocuments({
      studentId: student._id,
      puzzleId: puzzle._id,
      solved: true,
      _id: { $ne: attempt._id },
    });

    let xpAwarded = 0;
    const isFirstSolve = priorSolvedCount === 0;

    if (isFirstSolve) {
      // Award base puzzle XP (idempotently locked to puzzle ID)
      const xpRes = await GamificationService.awardXp(
        student._id,
        puzzle.xpReward,
        `Solved tactical puzzle: ${puzzle.title}`,
        'PUZZLE_SOLVE',
        puzzle._id.toString()
      );
      xpAwarded = xpRes.amountAwarded;

      student.puzzlesSolved += 1;
      await student.save();

      // Check and award First Puzzle badge if applicable
      await GamificationService.awardBadge(student._id, 'FIRST_PUZZLE');
    }

    // Maintain daily habit streak
    await GamificationService.recordStudentActivity(student._id);

    // Check today's Daily Challenge if it requires solving puzzles
    const today = new Date().toISOString().split('T')[0];
    const dailyChallenge = await DailyChallenge.findOne({ date: today });
    if (dailyChallenge && dailyChallenge.type === 'SOLVE_PUZZLES') {
      const todayUniqueSolves = await PuzzleAttempt.distinct('puzzleId', {
        studentId: student._id,
        solved: true,
        completedAt: {
          $gte: new Date(`${today}T00:00:00.000Z`),
          $lte: new Date(`${today}T23:59:59.999Z`),
        },
      });

      if (todayUniqueSolves.length >= dailyChallenge.targetCount) {
        // Award daily challenge bonus idempotently
        await GamificationService.awardXp(
          student._id,
          dailyChallenge.xpReward,
          `Completed daily challenge: ${dailyChallenge.title}`,
          'DAILY_CHALLENGE',
          `${dailyChallenge._id.toString()}_${today}`
        );
      }
    }

    return {
      correct: true,
      gameOver: true,
      feedback: 'Brilliant! Tactical puzzle completed!',
      fen: attempt.currentFen,
      moveNumber: attempt.currentMoveIndex,
      mistakes: attempt.mistakes,
      score: finalScore,
      xpAwarded,
    };
  }

  /**
   * Request progressive hint for current puzzle attempt.
   */
  static async useHint(
    attemptId: string,
    userId: string
  ): Promise<{
    hint: string;
    hintsUsed: number;
    hintIndex: number;
  }> {
    if (!Types.ObjectId.isValid(attemptId)) {
      const err = new Error('Invalid attempt ID format');
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    const student = await StudentProfile.findOne({ userId });
    if (!student) {
      const err = new Error('Student profile not found');
      (err as unknown as { statusCode: number }).statusCode = 404;
      throw err;
    }

    const attempt = await PuzzleAttempt.findById(attemptId);
    if (!attempt || !attempt.studentId.equals(student._id)) {
      const err = new Error('Attempt not found or access denied');
      (err as unknown as { statusCode: number }).statusCode = 404;
      throw err;
    }

    const puzzle = await Puzzle.findById(attempt.puzzleId);
    if (!puzzle) {
      const err = new Error('Puzzle not found');
      (err as unknown as { statusCode: number }).statusCode = 404;
      throw err;
    }

    attempt.hintsUsed += 1;
    await attempt.save();

    let hintText = puzzle.hint;
    const hintsList = puzzle.hints && puzzle.hints.length > 0 ? puzzle.hints : [puzzle.hint];
    const hintIndex = Math.min(attempt.hintsUsed - 1, hintsList.length - 1);
    hintText = hintsList[hintIndex];

    return {
      hint: hintText,
      hintsUsed: attempt.hintsUsed,
      hintIndex: hintIndex + 1,
    };
  }

  /**
   * Fetch authenticated student's puzzle attempt history.
   */
  static async getMyAttempts(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    attempts: IPuzzleAttempt[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const student = await StudentProfile.findOne({ userId });
    if (!student) {
      return { attempts: [], total: 0, page: 1, limit: 10, totalPages: 1 };
    }

    const skip = (page - 1) * limit;

    const [attempts, total] = await Promise.all([
      PuzzleAttempt.find({ studentId: student._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('puzzleId', 'title theme difficulty xpReward'),
      PuzzleAttempt.countDocuments({ studentId: student._id }),
    ]);

    return {
      attempts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
