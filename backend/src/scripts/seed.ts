import { connectDatabase, disconnectDatabase } from '../config/database';
import { Badge, Lesson, Puzzle, DailyChallenge } from '../models';

export async function seedDatabase() {
  console.log('=== KIDS CHESS ACADEMY: SEEDING DEVELOPMENT DATA ===\n');

  try {
    await connectDatabase();

    // 1. Seed Badges (Idempotent)
    console.log('[1/4] Seeding Achievement Badges...');
    const badgesData = [
      {
        badgeCode: 'FIRST_PUZZLE',
        name: 'First Puzzle Solved',
        description: 'Awarded for solving your very first tactical chess puzzle!',
        icon: '🌟',
        category: 'PUZZLES' as const,
      },
      {
        badgeCode: 'FIRST_GAME',
        name: 'First Chess Match',
        description: 'Awarded for completing your first full chess match!',
        icon: '♟️',
        category: 'GAMES' as const,
      },
      {
        badgeCode: 'STREAK_7',
        name: '7-Day Learning Streak',
        description: 'Awarded for practicing tactics 7 days in a row!',
        icon: '🔥',
        category: 'STREAKS' as const,
      },
      {
        badgeCode: 'PATTERN_MASTER',
        name: 'Pattern Master',
        description: 'Awarded for identifying 20 tactical patterns correctly!',
        icon: '🧠',
        category: 'PUZZLES' as const,
      },
      {
        badgeCode: 'TOURNAMENT_PLAYER',
        name: 'Tournament Competitor',
        description: 'Awarded for displaying great sportsmanship in an academy tournament!',
        icon: '🏆',
        category: 'SPORTSMANSHIP' as const,
      },
    ];

    let badgeCount = 0;
    for (const b of badgesData) {
      await Badge.findOneAndUpdate(
        { badgeCode: b.badgeCode },
        { $set: b },
        { upsert: true, new: true }
      );
      badgeCount++;
    }
    console.log(`  ✓ Synced ${badgeCount} badges (idempotent upsert)`);

    // 2. Seed Lessons (Idempotent)
    console.log('\n[2/4] Seeding Structured Lessons...');
    const lessonsData = [
      {
        title: 'Chess Basics & The Battlefield',
        slug: 'chess-basics',
        description: 'Discover the 64 squares, ranks, files, diagonals, and how to set up your army.',
        category: 'CHESS_BASICS' as const,
        difficulty: 'BEGINNER' as const,
        order: 1,
        xpReward: 50,
        isPublished: true,
        content: [
          {
            stepNumber: 1,
            type: 'TEXT' as const,
            text: 'Welcome to the world of chess! The board has 64 squares: 32 light and 32 dark. A white square always sits in your bottom-right corner.',
          },
          {
            stepNumber: 2,
            type: 'MULTIPLE_CHOICE' as const,
            question: 'Which square color must always be in your bottom-right corner during setup?',
            options: ['Light / White', 'Dark / Black', 'Either color', 'It changes every game'],
            correctAnswer: 'Light / White',
            explanation: 'Remember the golden rule: "White on the right!" The bottom-right square (h1 for White, a8 for Black) is always light.',
          },
        ],
      },
      {
        title: 'Piece Movements & Secret Powers',
        slug: 'piece-movement',
        description: 'Learn how Pawns march, Knights leap, and Queens dominate the board.',
        category: 'PIECE_MOVEMENT' as const,
        difficulty: 'BEGINNER' as const,
        order: 2,
        xpReward: 50,
        isPublished: true,
        content: [
          {
            stepNumber: 1,
            type: 'TEXT' as const,
            text: 'The Knight is the only piece on the chess board that can hop over other pieces! It moves in an "L" shape: 2 squares in one direction, then 1 square perpendicular.',
          },
          {
            stepNumber: 2,
            type: 'MULTIPLE_CHOICE' as const,
            question: 'Which chess piece is capable of jumping over other friendly or enemy pieces?',
            options: ['Rook', 'Bishop', 'Knight', 'Pawn'],
            correctAnswer: 'Knight',
            explanation: 'The Knight leaps with grace! It is never blocked by pieces between its starting and landing squares.',
          },
        ],
      },
      {
        title: 'Golden Opening Principles',
        slug: 'opening-principles',
        description: 'Control the four central squares, develop your minor pieces, and castle your King to safety.',
        category: 'OPENINGS' as const,
        difficulty: 'BEGINNER' as const,
        order: 3,
        xpReward: 60,
        isPublished: true,
        content: [
          {
            stepNumber: 1,
            type: 'TEXT' as const,
            text: 'In the opening, focus on three golden goals: 1) Stake claim to the central squares (e4, d4, e5, d5), 2) Develop Knights and Bishops, 3) Castle early for King safety.',
          },
          {
            stepNumber: 2,
            type: 'MULTIPLE_CHOICE' as const,
            question: 'Why is castling early recommended in the opening?',
            options: [
              'It tucks the King into safety and activates the Rook toward the center',
              'It gives you an extra queen immediately',
              'It forces an instant checkmate',
              'It eliminates opponent pawns',
            ],
            correctAnswer: 'It tucks the King into safety and activates the Rook toward the center',
            explanation: 'Castling accomplishes two vital tasks in one turn: protecting the King behind pawns and connecting your rooks.',
          },
        ],
      },
      {
        title: 'Tactics: The Royal Fork',
        slug: 'fork-tactics',
        description: 'Master the double attack where a single piece strikes two enemy pieces simultaneously.',
        category: 'TACTICS' as const,
        difficulty: 'INTERMEDIATE' as const,
        order: 4,
        xpReward: 70,
        isPublished: true,
        content: [
          {
            stepNumber: 1,
            type: 'TEXT' as const,
            text: 'A Fork occurs when one piece attacks two or more enemy pieces at the same time. The opponent can usually save only one!',
          },
          {
            stepNumber: 2,
            type: 'INTERACTIVE_BOARD' as const,
            fen: 'r1b1kb1r/ppq2ppp/2n5/3Np3/8/5N2/PPP2PPP/R1BQKB1R w KQkq - 0 1',
            text: 'White has a devastating Knight move! Find the square where your Knight attacks both Black\'s King and Queen.',
            interactiveMove: {
              from: 'd5',
              to: 'c7',
            },
            explanation: 'Nxc7+ checks the King on e8 while capturing the pawn and attacking the Queen on d8/c7!',
          },
        ],
      },
      {
        title: 'Tactics: The Absolute Pin',
        slug: 'pin-tactics',
        description: 'Immobilize opponent pieces by pinning them in line with a higher-value target or the King.',
        category: 'TACTICS' as const,
        difficulty: 'INTERMEDIATE' as const,
        order: 5,
        xpReward: 70,
        isPublished: true,
        content: [
          {
            stepNumber: 1,
            type: 'TEXT' as const,
            text: 'An Absolute Pin occurs when a piece is pinned against its King. The pinned piece is legally forbidden from moving because moving would leave the King in check!',
          },
          {
            stepNumber: 2,
            type: 'MULTIPLE_CHOICE' as const,
            question: 'Which of the following pieces can deliver a pin across a straight line or diagonal?',
            options: [
              'Bishops, Rooks, and Queens',
              'Knights and Pawns only',
              'Kings only',
              'Pawns only',
            ],
            correctAnswer: 'Bishops, Rooks, and Queens',
            explanation: 'Only long-range linear pieces (Bishops along diagonals, Rooks along ranks/files, Queens along both) can execute pins.',
          },
        ],
      },
      {
        title: 'Tactics: The Piercing Skewer',
        slug: 'skewer-tactics',
        description: 'Attack a high-value piece directly, forcing it to retreat and exposing the piece behind it.',
        category: 'TACTICS' as const,
        difficulty: 'INTERMEDIATE' as const,
        order: 6,
        xpReward: 70,
        isPublished: true,
        content: [
          {
            stepNumber: 1,
            type: 'TEXT' as const,
            text: 'A Skewer is like a reverse pin: the more valuable piece is in front! When the valuable piece steps out of danger, the piece behind it is captured.',
          },
          {
            stepNumber: 2,
            type: 'MULTIPLE_CHOICE' as const,
            question: 'What is the primary difference between a Pin and a Skewer?',
            options: [
              'In a skewer, the more valuable piece is in front and must move',
              'Skewers can only be played by knights',
              'Pins only happen in the endgame',
              'There is no difference',
            ],
            correctAnswer: 'In a skewer, the more valuable piece is in front and must move',
            explanation: 'Correct! A skewer forces the front piece (e.g. King or Queen) to flee, winning the piece resting behind it.',
          },
        ],
      },
    ];

    let lessonCount = 0;
    for (const l of lessonsData) {
      await Lesson.findOneAndUpdate(
        { slug: l.slug },
        { $set: l },
        { upsert: true, new: true }
      );
      lessonCount++;
    }
    console.log(`  ✓ Synced ${lessonCount} lessons (idempotent upsert)`);

    // 3. Seed Puzzles (Idempotent)
    console.log('\n[3/4] Seeding Tactical Puzzles...');
    const puzzlesData = [
      {
        title: 'Knight Royal Fork',
        fen: 'r1b1kb1r/ppq2ppp/2n5/3Np3/8/5N2/PPP2PPP/R1BQKB1R w KQkq - 0 1',
        solutionMoves: ['Nxc7+', 'Ke7', 'Nxa8'],
        theme: 'FORK' as const,
        difficulty: 650,
        hint: 'Can your knight attack both the King and the Queen at the same time?',
        xpReward: 25,
        isPublished: true,
      },
      {
        title: 'Bishop Absolute Pin',
        fen: 'r1b1k2r/pppp1ppp/8/8/1B1q4/8/PPP2PPP/R2QKB1R w KQkq - 0 1',
        solutionMoves: ['Bc3', 'Qe4+', 'Qe2'],
        theme: 'PIN' as const,
        difficulty: 750,
        hint: 'Look for how the bishop on b4 cuts across the diagonal towards Black\'s King.',
        xpReward: 25,
        isPublished: true,
      },
      {
        title: 'Back-Rank Checkmate Delivery',
        fen: '6k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1',
        solutionMoves: ['Rd8#'],
        theme: 'CHECKMATE' as const,
        difficulty: 500,
        hint: 'Notice Black\'s King is trapped behind its own wall of pawns!',
        xpReward: 20,
        isPublished: true,
      },
      {
        title: 'Rook Linear Skewer',
        fen: '4k3/8/8/8/8/8/8/R3K2r w Q - 0 1',
        solutionMoves: ['Rxh1'],
        theme: 'SKEWER' as const,
        difficulty: 700,
        hint: 'Capture the unguarded rook on h1!',
        xpReward: 20,
        isPublished: true,
      },
    ];

    let puzzleCount = 0;
    for (const p of puzzlesData) {
      await Puzzle.findOneAndUpdate(
        { title: p.title },
        { $set: p },
        { upsert: true, new: true }
      );
      puzzleCount++;
    }
    console.log(`  ✓ Synced ${puzzleCount} tactical puzzles (idempotent upsert)`);

    // 4. Seed Daily Challenge (Idempotent for current date)
    console.log('\n[4/4] Seeding Today\'s Daily Challenge...');
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const challengeData = {
      date: today,
      title: 'Knight Tactics Expedition',
      description: 'Sharpen your vision by solving 3 tactical chess puzzles today!',
      type: 'SOLVE_PUZZLES' as const,
      targetCount: 3,
      xpReward: 30,
    };

    await DailyChallenge.findOneAndUpdate(
      { date: today },
      { $set: challengeData },
      { upsert: true, new: true }
    );
    console.log(`  ✓ Synced Daily Challenge for ${today}: "${challengeData.title}"`);

    console.log('\n======================================================');
    console.log('✓ DEVELOPMENT SEED DATA APPLIED SUCCESSFULLY');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n❌ SEEDING FAILED:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

// Execute when invoked directly
if (require.main === module) {
  seedDatabase();
}

