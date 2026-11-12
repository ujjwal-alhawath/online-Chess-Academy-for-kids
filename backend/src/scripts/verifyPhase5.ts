import { Chess } from 'chess.js';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { User, StudentProfile } from '../models';
import { GameService } from '../services/game.service';
import { generateToken } from '../utils/jwt';
import { config } from '../config/env';
import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { gameRoutes } from '../routes/game.routes';
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

async function runPhase5Verification() {
  console.log('\n=== KIDS CHESS ACADEMY: PHASE 5 CHESSBOARD, ENGINE & GAME VERIFICATION ===\n');

  try {
    // ----------------------------------------------------
    // TEST SUITE 5.1: Chess Rules & State Engine (chess.js)
    // ----------------------------------------------------
    console.log('[Test Suite 5.1] Core Chess Rules Engine (chess.js):');

    // 1. Starting position
    const chess = new Chess();
    recordTest(
      'Standard initial board FEN is correct',
      chess.fen() === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    );

    // 2. Legal pawn move
    const m1 = chess.move({ from: 'e2', to: 'e4' });
    recordTest('Legal pawn move e2->e4 executes and updates turn to black', Boolean(m1 && chess.turn() === 'b'));

    // 3. Illegal move rejection
    let threwIllegal = false;
    try {
      chess.move({ from: 'e7', to: 'e4' }); // cannot land on occupied square by pawn forward
    } catch {
      threwIllegal = true;
    }
    recordTest('Illegal chess move is rejected', threwIllegal);

    // 4. Knight move
    const m2 = chess.move({ from: 'g8', to: 'f6' });
    recordTest('Legal knight move g8->f6 executes', Boolean(m2 && m2.san === 'Nf6'));

    // 5. Castling Test (Kingside)
    const castleChess = new Chess('rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4');
    const castleMove = castleChess.move({ from: 'e1', to: 'g1' });
    recordTest(
      'Kingside castling e1->g1 moves King and Rook properly',
      Boolean(castleMove && castleMove.san === 'O-O' && castleChess.get('f1')?.type === 'r')
    );

    // 6. En Passant Test
    const epChess = new Chess('rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3');
    const epMove = epChess.move({ from: 'e5', to: 'f6' });
    recordTest(
      'En passant capture executes properly',
      Boolean(epMove && epMove.san === 'exf6' && !epChess.get('f5'))
    );

    // 7. Pawn Promotion Test
    const promoChess = new Chess('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
    const promoMove = promoChess.move({ from: 'e7', to: 'e8', promotion: 'q' });
    recordTest(
      'Pawn promotion to Queen (e7->e8=Q) succeeds',
      Boolean(promoMove && promoMove.san === 'e8=Q' && promoChess.get('e8')?.type === 'q')
    );

    // 8. In-Check detection
    const checkChess = new Chess('rnb1kbnr/pppp1ppp/8/4p3/5PPq/8/PPPPP2P/RNBQKBNR w KQkq - 1 3');
    recordTest('In-check condition correctly identified', checkChess.isCheck() === true);

    // 9. Scholar\'s Mate (Checkmate detection)
    const mateChess = new Chess();
    mateChess.move('e4');
    mateChess.move('e5');
    mateChess.move('Bc4');
    mateChess.move('Nc6');
    mateChess.move('Qh5');
    mateChess.move('Nf6');
    mateChess.move('Qxf7#');
    recordTest(
      'Scholar’s Mate correctly triggers isCheckmate() and ends game',
      mateChess.isCheckmate() === true && mateChess.isGameOver() === true
    );

    // 10. Stalemate detection
    const staleChess = new Chess('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
    recordTest(
      'Stalemate correctly identified without check',
      staleChess.isStalemate() === true && staleChess.isCheck() === false
    );

    // 11. Insufficient Material (Draw detection)
    const materialChess = new Chess('8/8/8/4k3/8/8/8/4K3 w - - 0 1');
    recordTest('Insufficient material (King vs King) identified as draw', materialChess.isInsufficientMaterial() === true);

    // ----------------------------------------------------
    // TEST SUITE 5.2: Database & Game Service Integration
    // ----------------------------------------------------
    console.log('\n[Test Suite 5.2] Database & Game Service Integration:');
    await connectDatabase();

    // Clean up previous test games/users
    await User.deleteMany({ username: { $in: ['p5_student1', 'p5_student2', 'p5_intruder'] } });
    await StudentProfile.deleteMany({ displayName: { $in: ['P5 Player 1', 'P5 Player 2', 'P5 Intruder'] } });

    // Seed test students
    const user1 = await User.create({
      username: 'p5_student1',
      role: 'STUDENT',
      isActive: true,
      passwordHash: 'dummy_hash',
    });
    const profile1 = await StudentProfile.create({
      userId: user1._id,
      displayName: 'P5 Player 1',
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
      parentLinkCode: 'P5-PLAY1',
    });

    const user2 = await User.create({
      username: 'p5_student2',
      role: 'STUDENT',
      isActive: true,
      passwordHash: 'dummy_hash',
    });
    await StudentProfile.create({
      userId: user2._id,
      displayName: 'P5 Player 2',
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
      parentLinkCode: 'P5-PLAY2',
    });

    const intruder = await User.create({
      username: 'p5_intruder',
      role: 'STUDENT',
      isActive: true,
      passwordHash: 'dummy_hash',
    });

    // 1. Create AI Game
    const aiGame = await GameService.createGame({
      userId: user1._id.toString(),
      gameMode: 'AI',
      aiLevel: 'EASY',
      playerColor: 'white',
    });

    recordTest(
      'GameService.createGame creates valid AI game with white human & black AI',
      aiGame.gameMode === 'AI' &&
        aiGame.whiteIsAI === false &&
        aiGame.blackIsAI === true &&
        aiGame.whitePlayerId?.toString() === user1._id.toString() &&
        aiGame.result === 'IN_PROGRESS'
    );

    // 2. Authoritative Move: e2->e4
    const moveRes1 = await GameService.makeMove({
      gameId: aiGame._id.toString(),
      userId: user1._id.toString(),
      from: 'e2',
      to: 'e4',
    });

    recordTest(
      'Authoritative move e2->e4 updates game currentFen and records SAN',
      moveRes1.move.san === 'e4' &&
        moveRes1.game.moves.length === 1 &&
        moveRes1.game.currentFen.includes('4P3')
    );

    // 3. Turn enforcement: White player cannot move twice in a row
    let doubleMoveThrew = false;
    try {
      await GameService.makeMove({
        gameId: aiGame._id.toString(),
        userId: user1._id.toString(),
        from: 'd2',
        to: 'd4',
      });
    } catch {
      doubleMoveThrew = true;
    }
    recordTest('Turn enforcement prevents White from making consecutive move', doubleMoveThrew);

    // 4. AI Move relay (e7->e5)
    const moveRes2 = await GameService.makeMove({
      gameId: aiGame._id.toString(),
      userId: user1._id.toString(), // Human relaying AI move
      from: 'e7',
      to: 'e5',
    });

    recordTest(
      'AI move e7->e5 applied successfully',
      moveRes2.move.san === 'e5' && moveRes2.game.moves.length === 2
    );

    // 5. Illegal move rejected by server
    let serverIllegalThrew = false;
    try {
      await GameService.makeMove({
        gameId: aiGame._id.toString(),
        userId: user1._id.toString(),
        from: 'a2',
        to: 'a5', // Illegal pawn 3-square jump
      });
    } catch {
      serverIllegalThrew = true;
    }
    recordTest('Server-side chess.js rejects illegal move', serverIllegalThrew);

    // 6. Resignation Test
    const resignedGame = await GameService.resignGame(aiGame._id.toString(), user1._id.toString());
    recordTest(
      'Resignation marks game as BLACK_WON with RESIGNATION reason',
      resignedGame.result === 'BLACK_WON' &&
        resignedGame.terminationReason === 'RESIGNATION' &&
        resignedGame.completedAt !== null
    );

    // 7. Verify Gamification completion XP on resignation
    const updatedProf1 = await StudentProfile.findById(profile1._id);
    recordTest(
      'Resignation triggers +25 completion XP and increments gamesPlayed',
      Boolean(updatedProf1 && updatedProf1.xp === 25 && updatedProf1.gamesPlayed === 1 && updatedProf1.gamesLost === 1)
    );

    // 8. Scholar\'s Mate Game for Victory Gamification Test (+50 XP bonus)
    const victoryGame = await GameService.createGame({
      userId: user1._id.toString(),
      gameMode: 'AI',
      aiLevel: 'EASY',
      playerColor: 'white',
    });

    await GameService.makeMove({ gameId: victoryGame._id.toString(), userId: user1._id.toString(), from: 'e2', to: 'e4' });
    await GameService.makeMove({ gameId: victoryGame._id.toString(), userId: user1._id.toString(), from: 'e7', to: 'e5' });
    await GameService.makeMove({ gameId: victoryGame._id.toString(), userId: user1._id.toString(), from: 'd1', to: 'h5' });
    await GameService.makeMove({ gameId: victoryGame._id.toString(), userId: user1._id.toString(), from: 'b8', to: 'c6' });
    await GameService.makeMove({ gameId: victoryGame._id.toString(), userId: user1._id.toString(), from: 'f1', to: 'c4' });
    await GameService.makeMove({ gameId: victoryGame._id.toString(), userId: user1._id.toString(), from: 'g8', to: 'f6' });
    const mateRes = await GameService.makeMove({
      gameId: victoryGame._id.toString(),
      userId: user1._id.toString(),
      from: 'h5',
      to: 'f7', // Qxf7# Checkmate!
    });

    recordTest(
      'Server-side Scholar’s mate concludes game with WHITE_WON & CHECKMATE',
      mateRes.isTerminal === true &&
        mateRes.result === 'WHITE_WON' &&
        mateRes.game.terminationReason === 'CHECKMATE'
    );

    // Check student profile: previous 25 XP + (25 completion XP + 50 win bonus) = 100 XP (Level 2!)
    const victoryProf = await StudentProfile.findById(profile1._id);
    recordTest(
      'Checkmate victory awards +75 XP (25 finish + 50 win) reaching 100 XP & Level 2',
      Boolean(victoryProf && victoryProf.xp === 100 && victoryProf.level === 2 && victoryProf.gamesWon === 1)
    );

    // 9. Idempotency test: Re-attempting move on completed game throws
    let finishedMoveThrew = false;
    try {
      await GameService.makeMove({
        gameId: victoryGame._id.toString(),
        userId: user1._id.toString(),
        from: 'a7',
        to: 'a6',
      });
    } catch {
      finishedMoveThrew = true;
    }
    recordTest('Cannot execute moves on completed game', finishedMoveThrew);

    // ----------------------------------------------------
    // TEST SUITE 5.3: REST API & Authorization RBAC
    // ----------------------------------------------------
    console.log('\n[Test Suite 5.3] REST API Endpoints & Security:');

    const app = express();
    app.use(cors({ origin: true, credentials: true }));
    app.use(cookieParser());
    app.use(express.json());
    app.use('/api/games', gameRoutes);
    app.use(errorHandler);

    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address() as { port: number };
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const student1Token = generateToken({ userId: user1._id.toString(), role: 'STUDENT' });
    const intruderToken = generateToken({ userId: intruder._id.toString(), role: 'STUDENT' });

    // 1. POST /api/games without auth -> 401
    const resNoAuth = await fetch(`${baseUrl}/api/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameMode: 'AI' }),
    });
    recordTest('POST /api/games without auth cookie returns 401 Unauthorized', resNoAuth.status === 401);

    // 2. POST /api/games with auth -> 201
    const resCreate = await fetch(`${baseUrl}/api/games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${config.cookieName}=${student1Token}`,
      },
      body: JSON.stringify({ gameMode: 'AI', aiLevel: 'MEDIUM', playerColor: 'white' }),
    });
    const createData = (await resCreate.json()) as { success: boolean; game: { _id: string; currentFen: string } };
    recordTest('POST /api/games with valid auth creates game and returns 201', resCreate.status === 201 && createData.success);

    const activeGameId = createData.game._id;

    // 3. GET /api/games/:gameId by participant -> 200
    const resGet = await fetch(`${baseUrl}/api/games/${activeGameId}`, {
      headers: { Cookie: `${config.cookieName}=${student1Token}` },
    });
    recordTest('GET /api/games/:gameId by participant returns 200 OK', resGet.status === 200);

    // 4. GET /api/games/:gameId by unauthorized intruder -> 403 Forbidden
    const resIntruder = await fetch(`${baseUrl}/api/games/${activeGameId}`, {
      headers: { Cookie: `${config.cookieName}=${intruderToken}` },
    });
    recordTest('GET /api/games/:gameId by intruder returns 403 Forbidden', resIntruder.status === 403);

    // 5. POST /api/games/:gameId/moves valid move -> 200
    const resMove = await fetch(`${baseUrl}/api/games/${activeGameId}/moves`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${config.cookieName}=${student1Token}`,
      },
      body: JSON.stringify({ from: 'e2', to: 'e4' }),
    });
    const moveData = (await resMove.json()) as { success: boolean; move: { san: string } };
    recordTest('POST /api/games/:gameId/moves executes move and returns 200', resMove.status === 200 && moveData.move.san === 'e4');

    // 6. POST /api/games/:gameId/resign -> 200
    const resResign = await fetch(`${baseUrl}/api/games/${activeGameId}/resign`, {
      method: 'POST',
      headers: { Cookie: `${config.cookieName}=${student1Token}` },
    });
    recordTest('POST /api/games/:gameId/resign returns 200 OK', resResign.status === 200);

    // 7. GET /api/games/history -> 200 with list
    const resHistory = await fetch(`${baseUrl}/api/games/history?page=1&limit=5`, {
      headers: { Cookie: `${config.cookieName}=${student1Token}` },
    });
    const historyData = (await resHistory.json()) as { success: boolean; total: number; games: unknown[] };
    recordTest(
      'GET /api/games/history returns 200 with user games list',
      resHistory.status === 200 && historyData.success && historyData.total >= 2
    );

    // Clean up server
    server.close();

    // Summary
    console.log('\n======================================================');
    console.log(`Phase 5 Verification Complete: ${testsPassed} Passed, ${testsFailed} Failed.`);
    if (testsFailed === 0) {
      console.log('✓ ALL 25 PHASE 5 TESTS PASSED SUCCESSFULLY');
    }
    console.log('======================================================\n');
  } finally {
    await disconnectDatabase();
  }

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runPhase5Verification();
