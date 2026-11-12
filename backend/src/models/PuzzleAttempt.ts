import { Schema, model, Document, Model, Types } from 'mongoose';

export type PuzzleAttemptStatus = 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'ABANDONED';

export interface IPuzzleAttempt extends Document {
  studentId: Types.ObjectId;
  puzzleId: Types.ObjectId;
  status: PuzzleAttemptStatus;
  solved: boolean;
  currentFen: string;
  currentMoveIndex: number;
  attemptsCount: number;
  mistakes: number;
  hintsUsed: number;
  score: number;
  timeSpentSeconds: number;
  submittedMoves: string[];
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const puzzleAttemptSchema = new Schema<IPuzzleAttempt>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: [true, 'Student reference is required'],
      index: true,
    },
    puzzleId: {
      type: Schema.Types.ObjectId,
      ref: 'Puzzle',
      required: [true, 'Puzzle reference is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['IN_PROGRESS', 'COMPLETED', 'FAILED', 'ABANDONED'],
      default: 'IN_PROGRESS',
      index: true,
    },
    solved: {
      type: Boolean,
      default: false,
      index: true,
    },
    currentFen: {
      type: String,
      default: '',
    },
    currentMoveIndex: {
      type: Number,
      default: 0,
      min: 0,
    },
    attemptsCount: {
      type: Number,
      default: 1,
      min: [1, 'Attempts count must be at least 1'],
    },
    mistakes: {
      type: Number,
      default: 0,
      min: 0,
    },
    hintsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
      min: [0, 'Time spent cannot be negative'],
    },
    submittedMoves: {
      type: [String],
      default: [],
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying recent attempts by a student
puzzleAttemptSchema.index({ studentId: 1, createdAt: -1 });

export const PuzzleAttempt: Model<IPuzzleAttempt> = model<IPuzzleAttempt>(
  'PuzzleAttempt',
  puzzleAttemptSchema
);

