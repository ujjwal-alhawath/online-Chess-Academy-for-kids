import { Schema, model, Document, Model } from 'mongoose';

export type ChallengeType =
  | 'SOLVE_PUZZLES'
  | 'PLAY_AI_GAME'
  | 'COMPLETE_LESSON';

export interface IDailyChallenge extends Document {
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  type: ChallengeType;
  targetCount: number;
  xpReward: number;
  createdAt: Date;
  updatedAt: Date;
}

const dailyChallengeSchema = new Schema<IDailyChallenge>(
  {
    date: {
      type: String,
      required: [true, 'Challenge date is required (YYYY-MM-DD)'],
      unique: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Challenge title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Challenge description is required'],
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    type: {
      type: String,
      enum: {
        values: ['SOLVE_PUZZLES', 'PLAY_AI_GAME', 'COMPLETE_LESSON'],
        message: '{VALUE} is not a valid daily challenge type',
      },
      required: [true, 'Challenge type is required'],
    },
    targetCount: {
      type: Number,
      default: 1,
      min: [1, 'Target count must be at least 1'],
    },
    xpReward: {
      type: Number,
      default: 30,
      min: [0, 'XP reward cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

export const DailyChallenge: Model<IDailyChallenge> = model<IDailyChallenge>(
  'DailyChallenge',
  dailyChallengeSchema
);
