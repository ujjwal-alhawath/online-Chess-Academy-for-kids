import http from 'http';
import app from '../server';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { User, StudentProfile, ParentProfile, TeacherProfile } from '../models';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

interface ApiResponsePayload {
  success?: boolean;
  message?: string;
  user?: {
    id?: string;
    username?: string;
    role?: string;
    passwordHash?: string;
  };
  profile?: {
    displayName?: string;
    chessRating?: number;
    parentLinkCode?: string;
    title?: string;
    linkedStudentIds?: string[];
  };
  token?: string;
  linkedStudent?: {
    id?: string;
    displayName?: string;
    chessRating?: number;
    level?: number;
  };
}

const results: TestResult[] = [];

function recordTest(name: string, passed: boolean, details?: string) {
  results.push({ name, passed, details });
  const status = passed ? '✓ PASS' : '❌ FAIL';
  console.log(`  ${status}: ${name} ${details ? `(${details})` : ''}`);
}

async function runAuthVerification() {
  console.log('=== KIDS CHESS ACADEMY: AUTHENTICATION & RBAC VERIFICATION ===\n');

  let server: http.Server | null = null;
  let baseUrl = '';

  try {
    await connectDatabase();

    // Clean up any previous test accounts
    const testUsernames = [
      'test_student_auth',
      'test_parent_auth',
      'test_teacher_auth',
      'test_admin_probe',
    ];
    const oldUsers = await User.find({ username: { $in: testUsernames } });
    const oldUserIds = oldUsers.map((u) => u._id);
    await StudentProfile.deleteMany({ userId: { $in: oldUserIds } });
    await ParentProfile.deleteMany({ userId: { $in: oldUserIds } });
    await TeacherProfile.deleteMany({ userId: { $in: oldUserIds } });
    await User.deleteMany({ username: { $in: testUsernames } });

    // Start in-process HTTP server on random available port
    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server!.listen(0, () => resolve());
    });
    const addr = server.address() as { port: number };
    baseUrl = `http://127.0.0.1:${addr.port}`;
    console.log(`[Test Server] Running on ephemeral port: ${addr.port}\n`);

    let studentCookie = '';
    let studentParentCode = '';
    let parentCookie = '';
    let teacherCookie = '';

    // ==========================================
    // 1. REGISTRATION TESTS
    // ==========================================
    console.log('[Phase 3.1] Testing Registration & Profiles:');

    // 1a. Student registration (No email required)
    const resRegStudent = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test_student_auth',
        password: 'Password123!',
        role: 'STUDENT',
        displayName: 'Little Pawn Hero',
      }),
    });
    const dataRegStudent = (await resRegStudent.json()) as ApiResponsePayload;
    studentCookie = resRegStudent.headers.get('set-cookie') || '';
    studentParentCode = dataRegStudent.profile?.parentLinkCode || '';

    recordTest(
      'Student registration without email',
      resRegStudent.status === 201 &&
        dataRegStudent.user?.username === 'test_student_auth' &&
        dataRegStudent.profile?.chessRating === 500 &&
        typeof studentParentCode === 'string' &&
        studentParentCode.length >= 6
    );

    recordTest(
      'Password hash and JWT token omitted from response JSON',
      dataRegStudent.user?.passwordHash === undefined &&
        dataRegStudent.token === undefined
    );

    recordTest(
      'HTTP-only cookie set on registration',
      studentCookie.includes('chess_academy_token=') &&
        studentCookie.toLowerCase().includes('httponly')
    );

    // 1b. Parent registration
    const resRegParent = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test_parent_auth',
        email: 'parent_auth@testacademy.com',
        password: 'Password123!',
        role: 'PARENT',
        displayName: 'Jane Doe',
      }),
    });
    const dataRegParent = (await resRegParent.json()) as ApiResponsePayload;
    parentCookie = resRegParent.headers.get('set-cookie') || '';

    recordTest(
      'Parent registration with required email',
      resRegParent.status === 201 &&
        dataRegParent.user?.role === 'PARENT' &&
        Array.isArray(dataRegParent.profile?.linkedStudentIds)
    );

    // 1c. Teacher registration
    const resRegTeacher = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test_teacher_auth',
        email: 'coach_auth@testacademy.com',
        password: 'Password123!',
        role: 'TEACHER',
        displayName: 'Coach David',
        title: 'Master Coach',
      }),
    });
    const dataRegTeacher = (await resRegTeacher.json()) as ApiResponsePayload;
    teacherCookie = resRegTeacher.headers.get('set-cookie') || '';

    recordTest(
      'Teacher registration with instructor title',
      resRegTeacher.status === 201 &&
        dataRegTeacher.user?.role === 'TEACHER' &&
        dataRegTeacher.profile?.title === 'Master Coach'
    );

    // 1d. Admin public registration prohibition
    const resRegAdmin = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test_admin_probe',
        password: 'Password123!',
        role: 'ADMIN',
        displayName: 'Malicious Admin Probe',
      }),
    });
    recordTest(
      'Prohibition of public ADMIN role self-registration',
      resRegAdmin.status === 400
    );

    // 1e. Duplicate username rejection
    const resDupUser = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test_student_auth',
        password: 'Password123!',
        role: 'STUDENT',
        displayName: 'Duplicate Student',
      }),
    });
    recordTest('Duplicate username rejected with 409 Conflict', resDupUser.status === 409);

    // ==========================================
    // 2. LOGIN & AUTHENTICATION TESTS
    // ==========================================
    console.log('\n[Phase 3.2] Testing Login & Authentication:');

    // 2a. Correct login
    const resLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test_student_auth',
        password: 'Password123!',
      }),
    });
    const dataLogin = (await resLogin.json()) as ApiResponsePayload;
    const loginCookie = resLogin.headers.get('set-cookie') || '';

    recordTest(
      'Login with valid credentials',
      resLogin.status === 200 &&
        dataLogin.user?.username === 'test_student_auth' &&
        loginCookie.includes('chess_academy_token=')
    );

    // 2b. Incorrect password
    const resBadPass = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test_student_auth',
        password: 'WrongPassword!',
      }),
    });
    recordTest('Login with incorrect password rejected with 401', resBadPass.status === 401);

    // 2c. Missing credentials
    const resEmptyLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: '',
        password: '',
      }),
    });
    recordTest('Login with missing fields rejected with 400', resEmptyLogin.status === 400);

    // ==========================================
    // 3. /ME SESSION VERIFICATION
    // ==========================================
    console.log('\n[Phase 3.3] Testing Current User (/api/auth/me):');

    // 3a. /me without cookie -> 401
    const resMeAnon = await fetch(`${baseUrl}/api/auth/me`);
    recordTest('Access /api/auth/me without cookie returns 401', resMeAnon.status === 401);

    // 3b. /me with student cookie -> 200 with profile
    const tokenValStudent = studentCookie.split(';')[0];
    const resMeAuth = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: tokenValStudent },
    });
    const dataMeAuth = (await resMeAuth.json()) as ApiResponsePayload;
    recordTest(
      'Access /api/auth/me with valid cookie returns user & profile',
      resMeAuth.status === 200 &&
        dataMeAuth.user?.username === 'test_student_auth' &&
        dataMeAuth.profile?.displayName === 'Little Pawn Hero'
    );

    // ==========================================
    // 4. RBAC ROLE GUARDS
    // ==========================================
    console.log('\n[Phase 3.4] Testing Role-Based Access Control (RBAC):');

    // 4a. Student accessing Teacher-only route -> 403 Forbidden
    const resStudentToTeacher = await fetch(`${baseUrl}/api/test-protected/teacher-only`, {
      headers: { Cookie: tokenValStudent },
    });
    recordTest(
      'Student accessing teacher-only endpoint returns 403 Forbidden',
      resStudentToTeacher.status === 403
    );

    // 4b. Teacher accessing Teacher-only route -> 200 OK
    const tokenValTeacher = teacherCookie.split(';')[0];
    const resTeacherToTeacher = await fetch(`${baseUrl}/api/test-protected/teacher-only`, {
      headers: { Cookie: tokenValTeacher },
    });
    recordTest(
      'Teacher accessing teacher-only endpoint returns 200 OK',
      resTeacherToTeacher.status === 200
    );

    // 4c. Parent accessing Admin-only route -> 403 Forbidden
    const tokenValParent = parentCookie.split(';')[0];
    const resParentToAdmin = await fetch(`${baseUrl}/api/test-protected/admin-only`, {
      headers: { Cookie: tokenValParent },
    });
    recordTest(
      'Parent accessing admin-only endpoint returns 403 Forbidden',
      resParentToAdmin.status === 403
    );

    // ==========================================
    // 5. PARENT-STUDENT LINKING
    // ==========================================
    console.log('\n[Phase 3.5] Testing Parent-Student Linking:');

    // 5a. Student attempting to call link-parent -> 403 Forbidden (requires PARENT role)
    const resStudentLink = await fetch(`${baseUrl}/api/auth/link-parent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: tokenValStudent,
      },
      body: JSON.stringify({ parentLinkCode: studentParentCode }),
    });
    recordTest(
      'Student calling link-parent rejected with 403 Forbidden',
      resStudentLink.status === 403
    );

    // 5b. Parent calling with invalid code -> 404 Not Found
    const resParentBadCode = await fetch(`${baseUrl}/api/auth/link-parent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: tokenValParent,
      },
      body: JSON.stringify({ parentLinkCode: 'INVALID9' }),
    });
    recordTest(
      'Parent linking with invalid code returns 404 Not Found',
      resParentBadCode.status === 404
    );

    // 5c. Parent linking with valid code -> 200 OK
    const resParentGoodCode = await fetch(`${baseUrl}/api/auth/link-parent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: tokenValParent,
      },
      body: JSON.stringify({ parentLinkCode: studentParentCode }),
    });
    const dataParentLink = (await resParentGoodCode.json()) as ApiResponsePayload;
    recordTest(
      'Parent linking with valid code returns 200 and linked student details',
      resParentGoodCode.status === 200 &&
        dataParentLink.linkedStudent?.displayName === 'Little Pawn Hero'
    );

    // 5d. Duplicate linking attempt -> 400 Bad Request
    const resDupLink = await fetch(`${baseUrl}/api/auth/link-parent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: tokenValParent,
      },
      body: JSON.stringify({ parentLinkCode: studentParentCode }),
    });
    recordTest(
      'Duplicate student linking safely rejected with 400 Bad Request',
      resDupLink.status === 400
    );

    // Verify database record updates
    const dbStudent = await StudentProfile.findOne({ userId: dataRegStudent.user?.id });
    const dbParent = await ParentProfile.findOne({ userId: dataRegParent.user?.id });
    const isDbLinked =
      Boolean(dbStudent?.parentUserId) &&
      Boolean(dbParent?.userId) &&
      dbStudent?.parentUserId?.toString() === dbParent?.userId?.toString() &&
      dbParent?.linkedStudentIds.some((id) => id.toString() === dbStudent?._id.toString());
    recordTest(
      'MongoDB records updated correctly on parent linking',
      Boolean(isDbLinked)
    );

    // ==========================================
    // 6. LOGOUT
    // ==========================================
    console.log('\n[Phase 3.6] Testing Logout:');
    const resLogout = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { Cookie: tokenValStudent },
    });
    const logoutCookie = resLogout.headers.get('set-cookie') || '';
    recordTest(
      'Logout endpoint clears authentication cookie',
      resLogout.status === 200 &&
        (logoutCookie.includes('chess_academy_token=;') ||
          logoutCookie.includes('Max-Age=0') ||
          logoutCookie.includes('Expires='))
    );

    // Clean up test documents
    await StudentProfile.deleteMany({ userId: { $in: oldUserIds } });
    await ParentProfile.deleteMany({ userId: { $in: oldUserIds } });
    await TeacherProfile.deleteMany({ userId: { $in: oldUserIds } });
    await User.deleteMany({ username: { $in: testUsernames } });

    // Print summary
    const allPassed = results.every((r) => r.passed);
    console.log('\n======================================================');
    if (allPassed) {
      console.log(`✓ ALL ${results.length} AUTHENTICATION & RBAC TESTS PASSED`);
    } else {
      console.log(`❌ SOME TESTS FAILED: ${results.filter((r) => !r.passed).length} failure(s)`);
    }
    console.log('======================================================\n');

    if (!allPassed) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await disconnectDatabase();
  }
}

// Run verification
runAuthVerification();
