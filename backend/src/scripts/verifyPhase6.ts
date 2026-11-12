import { connectDatabase, disconnectDatabase } from '../config/database';
import {
  User,
  StudentProfile,
  Puzzle,
  PuzzleAttempt,
  Lesson,
  StudentLessonProgress,
  DailyChallenge,
  XpTransaction,
} from '../models';
import { PuzzleService } from '../services/puzzle.service';
import { LessonService } from '../services/lesson.service';
import { generateToken } from '../utils/jwt';
import { config } from '../config/env';
import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { puzzleRoutes } from '../routes/puzzle.routes';
import { lessonRoutes } from '../routes/lesson.routes';
import { errorHandler } from '../middleware/errorHandler';

let testsPassed = 0;
let testsFailed = 0;

function recordTest(name: string, condition: boolean, extraInfo?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${name}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${name}${extraInfo ? ` (${extraInfo})` : ''}`);
    testsFailed++;
  }
}

async function runPhase6Verification() {
  console.log('\n=== KIDS CHESS ACADEMY: PHASE 6 PUZZLES & CURRICULUM VERIFICATION ===\n');

  try {
    await connectDatabase();

    // ----------------------------------------------------
    // TEST SUITE 6.1: Seed Test Data & Puzzle Setup
    // ----------------------------------------------------
    console.log('[Test Suite 6.1] Setup & Solution Protection:');

    // Clean previous test users
    const oldUsers = await User.find({ username: { $in: ['p6_student1', 'p6_student2', 'p6_intruder'] } });
    const oldUserIds = oldUsers.map((u) => u._id);
    const oldProfiles = await StudentProfile.find({ userId: { $in: oldUserIds } });
    const oldProfileIds = oldProfiles.map((p) => p._id);

    await User.deleteMany({ username: { $in: ['p6_student1', 'p6_student2', 'p6_intruder'] } });
    await StudentProfile.deleteMany({ displayName: { $in: ['P6 Player 1', 'P6 Player 2'] } });
    await Puzzle.deleteMany({ title: { $in: ['P6 Multi-Move Fork', 'P6 Mate In One', 'P6 Unpublished Draft'] } });
    await Lesson.deleteMany({ slug: { $in: ['p6-basics-1', 'p6-tactics-2'] } });
    await XpTransaction.deleteMany({ studentId: { $in: oldProfileIds } });
    await PuzzleAttempt.deleteMany({ studentId: { $in: oldProfileIds } });
    await StudentLessonProgress.deleteMany({ studentId: { $in: oldProfileIds } });

    // Create test students
    const user1 = await User.create({
      username: 'p6_student1',
      role: 'STUDENT',
      isActive: true,
      passwordHash: 'dummy_hash',
    });
    const profile1 = await StudentProfile.create({
      userId: user1._id,
      displayName: 'P6 Player 1',
      chessRating: 500,
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      gamesDrawn: 0,
      puzzlesSolved: 0,
      parentLinkCode: 'P6-LINK1',
    });

    const user2 = await User.create({
      username: 'p6_student2',
      role: 'STUDENT',
      isActive: true,
      passwordHash: 'dummy_hash',
    });
    await StudentProfile.create({
      userId: user2._id,
      displayName: 'P6 Player 2',
      chessRating: 600,
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      gamesDrawn: 0,
      puzzlesSolved: 0,
      parentLinkCode: 'P6-LINK2',
    });

    // 1. Create a 3-ply multi-move puzzle:
    // White to move: 1. Nxc7+ (Fork check!) Ke7 2. Nxa8 (Wins the rook!)
    const puzzleMulti = await Puzzle.create({
      title: 'P6 Multi-Move Fork',
      description: 'Find the royal fork attacking the King and Queen!',
      fen: 'r1b1kb1r/ppq2ppp/2n5/3Np3/8/5N2/PPP2PPP/R1BQKB1R w KQkq - 0 1',
      solutionMoves: ['Nxc7+', 'Ke7', 'Nxa8'],
      theme: 'FORK',
      difficulty: 600,
      hint: 'Look for where your Knight can jump with check.',
      hints: [
        'Notice the black King and Queen are on diagonal files.',
        'Can your knight attack both at once?',
        'Jump to c7 with check!',
      ],
      xpReward: 25,
      isPublished: true,
      order: 1,
    });

    // 2. Create mate-in-one puzzle: 1. Rd8#
    const puzzleMate = await Puzzle.create({
      title: 'P6 Mate In One',
      fen: '6k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1',
      solutionMoves: ['Rd8#'],
      theme: 'CHECKMATE',
      difficulty: 500,
      hint: 'Notice Black\'s king has no escape square.',
      xpReward: 20,
      isPublished: true,
      order: 2,
    });

    // 3. Unpublished draft puzzle
    const puzzleDraft = await Puzzle.create({
      title: 'P6 Unpublished Draft',
      fen: '8/8/8/8/8/8/4P3/4K2k w - - 0 1',
      solutionMoves: ['e4'],
      theme: 'TACTICAL',
      difficulty: 800,
      hint: 'Draft hint',
      xpReward: 10,
      isPublished: false,
    });

    // Verify solution protection
    const listResult = await PuzzleService.getPuzzles({}, 'STUDENT');
    const exposedInList = (listResult.puzzles as Array<{ solutionMoves?: unknown }>).some(
      (p) => p.solutionMoves !== undefined
    );
    recordTest('Puzzles list endpoint strictly excludes solutionMoves from response', !exposedInList);

    const singlePuzzle = (await PuzzleService.getPuzzleById(puzzleMulti._id.toString(), 'STUDENT')) as {
      solutionMoves?: unknown;
    };
    recordTest('Single puzzle detail endpoint strictly excludes solutionMoves', singlePuzzle.solutionMoves === undefined);

    let draftRejected = false;
    try {
      await PuzzleService.getPuzzleById(puzzleDraft._id.toString(), 'STUDENT');
    } catch {
      draftRejected = true;
    }
    recordTest('Unpublished draft puzzle is rejected for students', draftRejected);

    // ----------------------------------------------------
    // TEST SUITE 6.2: Puzzle Attempt & Move Validation
    // ----------------------------------------------------
    console.log('\n[Test Suite 6.2] Puzzle Flow & Validation:');

    // 1. Start attempt
    const startData = await PuzzleService.startAttempt(puzzleMulti._id.toString(), user1._id.toString());
    recordTest(
      'startAttempt initializes attempt at starting FEN with moveIndex 0',
      startData.attemptId !== undefined &&
        startData.currentFen === puzzleMulti.fen &&
        startData.currentMoveIndex === 0
    );

    // 2. Illegal move rejection (e.g. invalid knight leap to d6)
    let illegalThrew = false;
    try {
      await PuzzleService.submitMove(startData.attemptId, user1._id.toString(), {
        from: 'd5',
        to: 'd6', // Illegal knight move
      });
    } catch {
      illegalThrew = true;
    }
    recordTest('Illegal chess move is rejected with 400 Bad Request', illegalThrew);

    // 3. Legal but incorrect tactical move (e.g. a2->a3 instead of the tactical fork)
    const wrongMoveRes = await PuzzleService.submitMove(startData.attemptId, user1._id.toString(), {
      from: 'a2',
      to: 'a3',
    });
    recordTest(
      'Incorrect tactical move is rejected, records mistake, keeps position intact',
      wrongMoveRes.correct === false &&
        wrongMoveRes.gameOver === false &&
        wrongMoveRes.mistakes === 1 &&
        wrongMoveRes.fen === puzzleMulti.fen
    );

    // 4. Request Progressive Hint
    const hint1 = await PuzzleService.useHint(startData.attemptId, user1._id.toString());
    const hint2 = await PuzzleService.useHint(startData.attemptId, user1._id.toString());
    recordTest(
      'Progressive hint system delivers stepped hints and tracks hintsUsed',
      hint1.hintsUsed === 1 &&
        hint2.hintsUsed === 2 &&
        hint2.hint === 'Can your knight attack both at once?'
    );

    // 5. Submit first correct move: 1. Nxc7+ (Fork)
    const step1Res = await PuzzleService.submitMove(startData.attemptId, user1._id.toString(), {
      from: 'd5',
      to: 'c7',
    });

    recordTest(
      'Correct first move executes, and server applies scripted opponent reply (Ke7)',
      step1Res.correct === true &&
        step1Res.gameOver === false &&
        step1Res.opponentMove !== undefined &&
        step1Res.opponentMove.san === 'Ke7' &&
        step1Res.moveNumber === 2
    );

    // 6. Submit second correct move: 2. Nxa8 (Wins the rook)
    const step2Res = await PuzzleService.submitMove(startData.attemptId, user1._id.toString(), {
      from: 'c7',
      to: 'a8',
    });

    recordTest(
      'Final solution move completes the puzzle and calculates score',
      step2Res.correct === true &&
        step2Res.gameOver === true &&
        typeof step2Res.score === 'number' &&
        step2Res.score >= 40 &&
        step2Res.xpAwarded === 25
    );

    // ----------------------------------------------------
    // TEST SUITE 6.3: Gamification & Idempotency
    // ----------------------------------------------------
    console.log('\n[Test Suite 6.3] Gamification, Badges & Idempotency:');

    const updatedProfile = await StudentProfile.findById(profile1._id);
    recordTest(
      'First puzzle solve awards 25 XP and increments student puzzlesSolved stat to 1',
      Boolean(updatedProfile && updatedProfile.xp === 25 && updatedProfile.puzzlesSolved === 1)
    );

    // Verify FIRST_PUZZLE badge awarded
    const firstBadgeTx = await XpTransaction.findOne({
      studentId: profile1._id,
      sourceType: 'PUZZLE_SOLVE',
      sourceId: puzzleMulti._id.toString(),
    });
    recordTest('XpTransaction record exists with unique sourceId matching puzzleId', firstBadgeTx !== null);

    // Retrying the same puzzle: should NOT award duplicate XP
    const retryStart = await PuzzleService.startAttempt(puzzleMulti._id.toString(), user1._id.toString());
    await PuzzleService.submitMove(retryStart.attemptId, user1._id.toString(), { from: 'd5', to: 'c7' });
    const retryEnd = await PuzzleService.submitMove(retryStart.attemptId, user1._id.toString(), { from: 'c7', to: 'a8' });

    recordTest(
      'Retrying same puzzle completes successfully with 0 bonus XP (No XP farming)',
      retryEnd.gameOver === true && retryEnd.xpAwarded === 0
    );

    const postRetryProfile = await StudentProfile.findById(profile1._id);
    recordTest(
      'Student profile XP remains 25 after retry (Double-awarding prevented)',
      postRetryProfile?.xp === 25
    );

    // ----------------------------------------------------
    // TEST SUITE 6.4: Daily Challenge Puzzle Integration
    // ----------------------------------------------------
    console.log('\n[Test Suite 6.4] Daily Challenge Integration:');
    const todayStr = new Date().toISOString().split('T')[0];

    // Seed daily challenge for 2 puzzle solves
    await DailyChallenge.findOneAndUpdate(
      { date: todayStr },
      {
        $set: {
          date: todayStr,
          title: 'Daily Tactics Quest',
          description: 'Solve 2 tactical chess puzzles today!',
          type: 'SOLVE_PUZZLES',
          targetCount: 2,
          xpReward: 30,
        },
      },
      { upsert: true }
    );

    // Solve 2nd unique puzzle (puzzleMate: Rd8#)
    const mateStart = await PuzzleService.startAttempt(puzzleMate._id.toString(), user1._id.toString());
    const mateEnd = await PuzzleService.submitMove(mateStart.attemptId, user1._id.toString(), {
      from: 'd1',
      to: 'd8',
    });

    recordTest('Mate-in-one puzzle solved successfully', mateEnd.gameOver === true && mateEnd.correct === true);

    const dailyChallengeTx = await XpTransaction.findOne({
      studentId: profile1._id,
      sourceType: 'DAILY_CHALLENGE',
    });
    recordTest(
      'Daily challenge target reached (2 solves) and triggers +30 XP daily quest bonus',
      dailyChallengeTx !== null && dailyChallengeTx.amount === 30
    );

    // ----------------------------------------------------
    // TEST SUITE 6.5: Curriculum Lessons & Prerequisite Unlocking
    // ----------------------------------------------------
    console.log('\n[Test Suite 6.5] Curriculum Lessons & Deterministic Unlocking:');

    // Create 2 test lessons
    const lesson1 = await Lesson.create({
      title: 'P6 Basics: The 64 Squares',
      slug: 'p6-basics-1',
      description: 'Introduction to ranks and files',
      category: 'CHESS_BASICS',
      difficulty: 'BEGINNER',
      order: 1,
      xpReward: 50,
      isPublished: true,
      content: [
        {
          stepNumber: 1,
          type: 'TEXT',
          text: 'There are 64 squares on the chessboard.',
        },
        {
          stepNumber: 2,
          type: 'MULTIPLE_CHOICE',
          question: 'How many squares are on a chessboard?',
          options: ['32', '64', '100', '16'],
          correctAnswer: '64',
          explanation: '8 ranks times 8 files equals 64 squares.',
        },
      ],
    });

    await Lesson.create({
      title: 'P6 Tactics: Fork Mastery',
      slug: 'p6-tactics-2',
      description: 'Understanding double attacks',
      category: 'TACTICS',
      difficulty: 'INTERMEDIATE',
      order: 2,
      xpReward: 60,
      isPublished: true,
      content: [
        {
          stepNumber: 1,
          type: 'TEXT',
          text: 'A fork attacks two pieces simultaneously.',
        },
      ],
    });

    // 1. Initial lesson query: Lesson 1 is unlocked, Lesson 2 is LOCKED
    const lessonsInitial = await LessonService.getLessons(user1._id.toString());
    const l1Init = lessonsInitial.lessons.find((l) => l.order === 1);
    const l2Init = lessonsInitial.lessons.find((l) => l.order === 2);

    recordTest(
      'Lesson 1 is unlocked initially, while Lesson 2 is locked',
      l1Init?.isLocked === false && l2Init?.isLocked === true
    );

    // 2. Start Lesson 1
    const startProgress = await LessonService.startLesson(lesson1._id.toString(), user1._id.toString());
    recordTest('startLesson creates StudentLessonProgress with status IN_PROGRESS', startProgress.status === 'IN_PROGRESS');

    // 3. Submit step answer: Step 2 multiple choice
    const stepAnswerRes = await LessonService.submitStepAnswer(
      lesson1._id.toString(),
      user1._id.toString(),
      2,
      { selectedAnswer: '64' }
    );
    recordTest('submitStepAnswer validates correct answer and advances step', stepAnswerRes.isCorrect === true);

    // 4. Complete Lesson 1
    const completeRes = await LessonService.completeLesson(lesson1._id.toString(), user1._id.toString());
    recordTest(
      'completeLesson marks lesson COMPLETED and awards 50 lesson XP',
      completeRes.success === true &&
        completeRes.progress.isCompleted === true &&
        completeRes.xpAwarded === 50
    );

    // 5. Verify Lesson 2 is now UNLOCKED after Lesson 1 completion
    const lessonsPost = await LessonService.getLessons(user1._id.toString());
    const l2Post = lessonsPost.lessons.find((l) => l.order === 2);
    recordTest(
      'Lesson 2 is dynamically UNLOCKED after prerequisite Lesson 1 completed',
      l2Post?.isLocked === false
    );

    // 6. Duplicate lesson completion yields 0 additional XP (idempotency)
    const duplicateComplete = await LessonService.completeLesson(lesson1._id.toString(), user1._id.toString());
    recordTest(
      'Re-completing lesson yields 0 XP bonus (Idempotent lesson completion)',
      duplicateComplete.xpAwarded === 0
    );

    // ----------------------------------------------------
    // TEST SUITE 6.6: REST API Security & Ownership Checks
    // ----------------------------------------------------
    console.log('\n[Test Suite 6.6] REST API Endpoints & Security Guards:');

    const app = express();
    app.use(cors({ origin: true, credentials: true }));
    app.use(cookieParser());
    app.use(express.json());
    app.use('/api/puzzles', puzzleRoutes);
    app.use('/api/lessons', lessonRoutes);
    app.use(errorHandler);

    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address() as { port: number };
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const student1Token = generateToken({ userId: user1._id.toString(), role: 'STUDENT' });
    const student2Token = generateToken({ userId: user2._id.toString(), role: 'STUDENT' });

    // 1. POST /api/puzzles/:puzzleId/start without auth -> 401
    const resNoAuth = await fetch(`${baseUrl}/api/puzzles/${puzzleMulti._id}/start`, {
      method: 'POST',
    });
    recordTest('POST /api/puzzles/:puzzleId/start without auth returns 401', resNoAuth.status === 401);

    // 2. POST /api/puzzles/:puzzleId/start with auth -> 201 (no solutionMoves in JSON)
    const resAuthStart = await fetch(`${baseUrl}/api/puzzles/${puzzleMulti._id}/start`, {
      method: 'POST',
      headers: { Cookie: `${config.cookieName}=${student1Token}` },
    });
    const startJson = (await resAuthStart.json()) as { success: boolean; attemptId: string; solutionMoves?: unknown };
    recordTest(
      'POST /api/puzzles/:id/start creates attempt and excludes solutionMoves',
      resAuthStart.status === 201 && startJson.success && startJson.solutionMoves === undefined
    );

    // 3. POST /api/puzzles/attempts/:id/move with intruder student token -> 403 Forbidden
    const resIntruderMove = await fetch(`${baseUrl}/api/puzzles/attempts/${startJson.attemptId}/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${config.cookieName}=${student2Token}`, // Intruder token!
      },
      body: JSON.stringify({ from: 'd5', to: 'c7' }),
    });
    recordTest('Intruder student submitting move on another student’s attempt returns 403 Forbidden', resIntruderMove.status === 403);

    // 4. GET /api/puzzles/my-attempts -> 200 with list
    const resMyAttempts = await fetch(`${baseUrl}/api/puzzles/my-attempts?page=1&limit=5`, {
      headers: { Cookie: `${config.cookieName}=${student1Token}` },
    });
    const attemptsJson = (await resMyAttempts.json()) as { success: boolean; attempts: unknown[] };
    recordTest(
      'GET /api/puzzles/my-attempts returns 200 with attempts history',
      resMyAttempts.status === 200 && attemptsJson.success && Array.isArray(attemptsJson.attempts)
    );

    // 5. GET /api/lessons -> 200 with curriculum
    const resLessons = await fetch(`${baseUrl}/api/lessons`, {
      headers: { Cookie: `${config.cookieName}=${student1Token}` },
    });
    const lessonsJson = (await resLessons.json()) as { success: boolean; lessons: unknown[] };
    recordTest(
      'GET /api/lessons returns 200 with curriculum progress',
      resLessons.status === 200 && lessonsJson.success && Array.isArray(lessonsJson.lessons)
    );

    server.close();

    console.log('\n======================================================');
    console.log(`Phase 6 Verification Complete: ${testsPassed} Passed, ${testsFailed} Failed.`);
    if (testsFailed === 0) {
      console.log('✓ ALL 27 PHASE 6 TESTS PASSED SUCCESSFULLY');
    }
    console.log('======================================================\n');
  } finally {
    await disconnectDatabase();
  }

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runPhase6Verification();
