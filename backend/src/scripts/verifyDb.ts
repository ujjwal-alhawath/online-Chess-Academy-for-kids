import { connectDatabase, disconnectDatabase } from '../config/database';
import {
  User,
  StudentProfile,
  TeacherProfile,
  ParentProfile,
  Lesson,
  StudentLessonProgress,
  Puzzle,
  PuzzleAttempt,
  Game,
  Tournament,
  TournamentParticipant,
  TournamentMatch,
  Badge,
  StudentBadge,
  DailyChallenge,
  EmotionReflection,
} from '../models';

async function verifyDatabase() {
  console.log('=== KIDS CHESS ACADEMY: DATABASE VERIFICATION ===\n');

  try {
    // 1. Connection check
    console.log('[1/4] Connecting to MongoDB...');
    await connectDatabase();

    // 2. Model registration check
    console.log('\n[2/4] Verifying Model Registrations...');
    const models = [
      { name: 'User', model: User },
      { name: 'StudentProfile', model: StudentProfile },
      { name: 'TeacherProfile', model: TeacherProfile },
      { name: 'ParentProfile', model: ParentProfile },
      { name: 'Lesson', model: Lesson },
      { name: 'StudentLessonProgress', model: StudentLessonProgress },
      { name: 'Puzzle', model: Puzzle },
      { name: 'PuzzleAttempt', model: PuzzleAttempt },
      { name: 'Game', model: Game },
      { name: 'Tournament', model: Tournament },
      { name: 'TournamentParticipant', model: TournamentParticipant },
      { name: 'TournamentMatch', model: TournamentMatch },
      { name: 'Badge', model: Badge },
      { name: 'StudentBadge', model: StudentBadge },
      { name: 'DailyChallenge', model: DailyChallenge },
      { name: 'EmotionReflection', model: EmotionReflection },
    ];

    for (const { name, model } of models) {
      if (!model || !model.modelName) {
        throw new Error(`Model ${name} failed registration check!`);
      }
      console.log(`  ✓ ${name} registered (Collection: ${model.collection.name})`);
    }

    // 3. Index Synchronization
    console.log('\n[3/4] Synchronizing Database Indexes...');
    for (const { name, model } of models) {
      await model.syncIndexes();
      const indexes = await model.collection.indexes();
      console.log(`  ✓ ${name}: ${indexes.length} index(es) active`);
    }

    // 4. Safe ephemeral CRUD test (Zero pollution)
    console.log('\n[4/4] Executing Ephemeral CRUD Test...');
    const testCode = `VERIFY_TEMP_${Date.now()}`;
    const testBadge = await Badge.create({
      badgeCode: testCode,
      name: 'Verification Badge',
      description: 'Temporary verification document that is immediately removed.',
      icon: '🧪',
      category: 'PUZZLES',
    });

    const readBadge = await Badge.findOne({ badgeCode: testCode });
    if (!readBadge || readBadge.name !== 'Verification Badge') {
      throw new Error('CRUD verification failed: Created document could not be read back accurately');
    }

    // Clean up immediately
    await Badge.deleteOne({ _id: testBadge._id });
    const verifyClean = await Badge.findOne({ badgeCode: testCode });
    if (verifyClean) {
      throw new Error('CRUD cleanup failed: Temporary test document was not deleted');
    }
    console.log('  ✓ Create, Read, and Clean-Up operations passed with zero database pollution');

    console.log('\n======================================================');
    console.log('✓ ALL DATABASE VERIFICATION CHECKS PASSED SUCCESSFULLY');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n❌ DATABASE VERIFICATION FAILED:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

// Run script
verifyDatabase();
