import { Schema, model, Document, Model, Types } from 'mongoose';

export interface IPuzzleAttempt extends Document {
  studentId: Types.ObjectId;
  puzzleId: Types.ObjectId;
  solved: boolean;
  attemptsCount: number;
  timeSpentSeconds: number;
  submittedMoves: string[];
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
    solved: {
      type: Boolean,
      required: [true, 'Solved status is required'],
      index: true,
    },
    attemptsCount: {
      type: Number,
      default: 1,
      min: [1, 'Attempts count must be at least 1'],
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
