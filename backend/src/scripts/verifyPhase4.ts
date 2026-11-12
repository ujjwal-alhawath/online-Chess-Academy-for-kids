import http from 'http';
import app from '../server';
import { connectDatabase, disconnectDatabase } from '../config/database';
import {
  User,
  StudentProfile,
  TeacherProfile,
  ParentProfile,
  XpTransaction,
  StudentBadge,
} from '../models';
import { GamificationService } from '../services/gamification.service';
import { generateToken } from '../utils/jwt';
import { config } from '../config/env';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function recordTest(name: string, passed: boolean, details?: string) {
  results.push({ name, passed, details });
  const status = passed ? '✓ PASS' : '❌ FAIL';
  console.log(`  ${status}: ${name} ${details ? `(${details})` : ''}`);
}

async function runPhase4Verification() {
  console.log('=== KIDS CHESS ACADEMY: PHASE 4 GAMIFICATION & DASHBOARD VERIFICATION ===\n');

  let server: http.Server | null = null;
  let baseUrl = '';

  try {
    await connectDatabase();

    // ==========================================
    // 1. UNIT TEST: LEVEL & XP FORMULA
    // ==========================================
    console.log('[Test Suite 4.1] Deterministic XP & Level System:');

    recordTest(
      'Level 1 at 0 XP',
      GamificationService.getLevelFromXp(0) === 1
    );
    recordTest(
      'Level 1 at 99 XP',
      GamificationService.getLevelFromXp(99) === 1
    );
    recordTest(
      'Level 2 reached at exactly 100 XP',
      GamificationService.getLevelFromXp(100) === 2
    );
    recordTest(
      'Level 3 reached at exactly 250 XP',
      GamificationService.getLevelFromXp(250) === 3
    );
    recordTest(
      'Level 4 reached at exactly 450 XP',
      GamificationService.getLevelFromXp(450) === 4
    );
    recordTest(
      'Level 5 reached at exactly 700 XP',
      GamificationService.getLevelFromXp(700) === 5
    );

    const progNew = GamificationService.getXpProgress(0);
    recordTest(
      'New student XP progress (0 XP -> Level 1 with 0% progress)',
      progNew.currentLevel === 1 &&
        progNew.nextLevel === 2 &&
        progNew.xpInCurrentLevel === 0 &&
        progNew.xpNeededForNextLevel === 100 &&
        progNew.progressPercent === 0
    );

    const progHalfway = GamificationService.getXpProgress(175);
    recordTest(
      'Mid-level XP progress (175 XP -> Level 2 with 50% progress to Level 3)',
      progHalfway.currentLevel === 2 &&
        progHalfway.nextLevel === 3 &&
        progHalfway.xpInCurrentLevel === 75 &&
        progHalfway.xpNeededForNextLevel === 150 &&
        progHalfway.progressPercent === 50
    );

    // ==========================================
    // 2. UNIT TEST: XP AWARDS & TRANSACTION SAFETY
    // ==========================================
    console.log('\n[Test Suite 4.2] XP Awarding & Transaction Safety:');

    // Create a dedicated temporary student profile for testing
    const testUsername = `p4_student_${Date.now()}`;
    const testUser = await User.create({
      username: testUsername,
      passwordHash: 'dummy_hash',
      role: 'STUDENT',
    });
    const testStudent = await StudentProfile.create({
      userId: testUser._id,
      displayName: 'Phase 4 Tester',
      parentLinkCode: 'TESTCODE4',
      chessRating: 500,
      xp: 0,
      level: 1,
    });

    // 2a. Award initial XP
    const award1 = await GamificationService.awardXp(
      testStudent._id,
      120,
      'Solved tactical puzzle test',
      'PUZZLE_SOLVE',
      'puzzle_test_01'
    );
    recordTest(
      'XP award increments total and triggers Level 2 level-up',
      award1.xp === 120 && award1.level === 2 && award1.leveledUp === true
    );

    // 2b. Attempt duplicate award with same sourceId
    const dupAward = await GamificationService.awardXp(
      testStudent._id,
      120,
      'Duplicate attempt',
      'PUZZLE_SOLVE',
      'puzzle_test_01'
    );
    recordTest(
      'Duplicate action prevents double-crediting XP (Idempotency)',
      dupAward.duplicatePrevented === true && dupAward.xp === 120
    );

    // ==========================================
    // 3. UNIT TEST: STREAK SYSTEM
    // ==========================================
    console.log('\n[Test Suite 4.3] Daily Streak System:');

    // Day 1
    const day1 = new Date('2026-10-01T12:00:00.000Z');
    const s1 = await GamificationService.recordStudentActivity(testStudent._id, day1);
    recordTest(
      'First activity initializes currentStreak to 1',
      s1.currentStreak === 1 && s1.longestStreak === 1 && s1.streakUpdated === true
    );

    // Same day activity
    const s1SameDay = await GamificationService.recordStudentActivity(testStudent._id, day1);
    recordTest(
      'Repeated activity on same calendar day preserves currentStreak at 1',
      s1SameDay.currentStreak === 1 && s1SameDay.streakUpdated === false
    );

    // Consecutive Day 2
    const day2 = new Date('2026-10-02T15:00:00.000Z');
    const s2 = await GamificationService.recordStudentActivity(testStudent._id, day2);
    recordTest(
      'Activity on consecutive day increments streak to 2',
      s2.currentStreak === 2 && s2.longestStreak === 2
    );

    // Missed a day (Skip to Day 4)
    const day4 = new Date('2026-10-04T10:00:00.000Z');
    const s4 = await GamificationService.recordStudentActivity(testStudent._id, day4);
    recordTest(
      'Activity after missed day resets currentStreak to 1 while keeping longestStreak at 2',
      s4.currentStreak === 1 && s4.longestStreak === 2
    );

    // ==========================================
    // 4. UNIT TEST: BADGE AWARDING
    // ==========================================
    console.log('\n[Test Suite 4.4] Badge Awarding System:');

    const b1 = await GamificationService.awardBadge(testStudent._id, 'FIRST_PUZZLE');
    recordTest(
      'Awarding badge creates StudentBadge document',
      b1.unlocked === true && b1.alreadyHad === false
    );

    const b1Repeat = await GamificationService.awardBadge(testStudent._id, 'FIRST_PUZZLE');
    recordTest(
      'Awarding same badge again safely avoids duplicate creation',
      b1Repeat.unlocked === false && b1Repeat.alreadyHad === true
    );

    // ==========================================
    // 5. INTEGRATION TEST: STUDENT DASHBOARD API
    // ==========================================
    console.log('\n[Test Suite 4.5] Student Dashboard API & RBAC:');

    // Create teacher and parent test accounts
    const teacherUser = await User.create({
      username: `p4_teacher_${Date.now()}`,
      passwordHash: 'dummy',
      role: 'TEACHER',
    });
    await TeacherProfile.create({ userId: teacherUser._id, displayName: 'Coach P4' });

    const parentUser = await User.create({
      username: `p4_parent_${Date.now()}`,
      passwordHash: 'dummy',
      role: 'PARENT',
    });
    await ParentProfile.create({ userId: parentUser._id, displayName: 'Parent P4' });

    // Start in-process server
    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server!.listen(0, () => resolve());
    });
    const addr = server.address() as { port: number };
    baseUrl = `http://127.0.0.1:${addr.port}`;

    // 5a. Unauthenticated request -> 401
    const resAnon = await fetch(`${baseUrl}/api/students/dashboard`);
    recordTest('Dashboard request without auth returns 401 Unauthorized', resAnon.status === 401);

    // 5b. Teacher access -> 403
    const teacherToken = generateToken({ userId: teacherUser._id.toString(), role: 'TEACHER' });
    const resTeacher = await fetch(`${baseUrl}/api/students/dashboard`, {
      headers: { Cookie: `${config.cookieName}=${teacherToken}` },
    });
    recordTest('Teacher accessing student dashboard returns 403 Forbidden', resTeacher.status === 403);

    // 5c. Parent access -> 403
    const parentToken = generateToken({ userId: parentUser._id.toString(), role: 'PARENT' });
    const resParent = await fetch(`${baseUrl}/api/students/dashboard`, {
      headers: { Cookie: `${config.cookieName}=${parentToken}` },
    });
    recordTest('Parent accessing student dashboard returns 403 Forbidden', resParent.status === 403);

    // 5d. Student access -> 200 with full DTO
    const studentToken = generateToken({ userId: testUser._id.toString(), role: 'STUDENT' });
    const resStudent = await fetch(`${baseUrl}/api/students/dashboard`, {
      headers: { Cookie: `${config.cookieName}=${studentToken}` },
    });
    const dataStudent = (await resStudent.json()) as {
      success: boolean;
      student?: {
        displayName: string;
        rating: number;
        passwordHash?: string;
        parentUserId?: string;
        xpProgress?: { currentLevel: number };
      };
      badges?: unknown[];
      learningProgress?: unknown[];
      recentActivity?: unknown[];
      dailyChallenge?: { title: string } | null;
    };

    recordTest(
      'Student accessing dashboard returns 200 OK with correct DTO structure',
      resStudent.status === 200 &&
        dataStudent.success === true &&
        dataStudent.student?.displayName === 'Phase 4 Tester' &&
        dataStudent.student?.rating === 500 &&
        dataStudent.student?.xpProgress?.currentLevel === 2 &&
        Array.isArray(dataStudent.badges) &&
        Array.isArray(dataStudent.learningProgress) &&
        Array.isArray(dataStudent.recentActivity)
    );

    recordTest(
      'Daily challenge returned in dashboard response',
      Boolean(dataStudent.dailyChallenge && typeof dataStudent.dailyChallenge.title === 'string')
    );

    recordTest(
      'Sensitive fields (passwordHash, parentUserId) omitted from response',
      dataStudent.student?.passwordHash === undefined &&
        dataStudent.student?.parentUserId === undefined
    );

    // 5e. Test GET /api/students/daily-challenge
    const resChallenge = await fetch(`${baseUrl}/api/students/daily-challenge`, {
      headers: { Cookie: `${config.cookieName}=${studentToken}` },
    });
    const dataChallenge = (await resChallenge.json()) as {
      success: boolean;
      challenge?: { title: string };
    };
    recordTest(
      'GET /api/students/daily-challenge returns 200 with challenge data',
      resChallenge.status === 200 && Boolean(dataChallenge.challenge?.title)
    );

    // ==========================================
    // CLEANUP
    // ==========================================
    await StudentBadge.deleteMany({ studentId: testStudent._id });
    await XpTransaction.deleteMany({ studentId: testStudent._id });
    await StudentProfile.deleteOne({ _id: testStudent._id });
    await TeacherProfile.deleteOne({ userId: teacherUser._id });
    await ParentProfile.deleteOne({ userId: parentUser._id });
    await User.deleteMany({ _id: { $in: [testUser._id, teacherUser._id, parentUser._id] } });

    // Print summary
    const allPassed = results.every((r) => r.passed);
    console.log('\n======================================================');
    if (allPassed) {
      console.log(`✓ ALL ${results.length} PHASE 4 TESTS PASSED SUCCESSFULLY`);
    } else {
      console.log(`❌ SOME TESTS FAILED: ${results.filter((r) => !r.passed).length} failure(s)`);
    }
    console.log('======================================================\n');

    if (!allPassed) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Phase 4 verification failed with error:', err);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await disconnectDatabase();
  }
}

// Execute when run directly
runPhase4Verification();
