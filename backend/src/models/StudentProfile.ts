import { Schema, model, Document, Model, Types } from 'mongoose';

export interface IStudentProfile extends Document {
  userId: Types.ObjectId;
  displayName: string;
  avatar: string;
  chessRating: number;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date | null;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDrawn: number;
  puzzlesSolved: number;
  parentUserId: Types.ObjectId | null;
  parentLinkCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const studentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      minlength: [2, 'Display name must be at least 2 characters'],
      maxlength: [40, 'Display name cannot exceed 40 characters'],
    },
    avatar: {
      type: String,
      default: 'knight_blue',
      trim: true,
    },
    chessRating: {
      type: Number,
      default: 500,
      min: [100, 'Rating cannot fall below 100'],
      index: true,
    },
    xp: {
      type: Number,
      default: 0,
      min: [0, 'XP cannot be negative'],
    },
    level: {
      type: Number,
      default: 1,
      min: [1, 'Level cannot be below 1'],
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: [0, 'Current streak cannot be negative'],
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: [0, 'Longest streak cannot be negative'],
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
    gamesPlayed: {
      type: Number,
      default: 0,
      min: [0, 'Games played cannot be negative'],
    },
    gamesWon: {
      type: Number,
      default: 0,
      min: [0, 'Games won cannot be negative'],
    },
    gamesLost: {
      type: Number,
      default: 0,
      min: [0, 'Games lost cannot be negative'],
    },
    gamesDrawn: {
      type: Number,
      default: 0,
      min: [0, 'Games drawn cannot be negative'],
    },
    puzzlesSolved: {
      type: Number,
      default: 0,
      min: [0, 'Puzzles solved cannot be negative'],
    },
    parentUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    parentLinkCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const StudentProfile: Model<IStudentProfile> = model<IStudentProfile>(
  'StudentProfile',
  studentProfileSchema
);

