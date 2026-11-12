import { Schema, model, Document, Model } from 'mongoose';

export type PuzzleTheme =
  | 'FORK'
  | 'PIN'
  | 'SKEWER'
  | 'CHECKMATE'
  | 'DEFLECTION'
  | 'PATTERN_RECOGNITION';

export interface IPuzzle extends Document {
  title: string;
  fen: string;
  solutionMoves: string[];
  theme: PuzzleTheme;
  difficulty: number;
  hint: string;
  xpReward: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const puzzleSchema = new Schema<IPuzzle>(
  {
    title: {
      type: String,
      required: [true, 'Puzzle title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    fen: {
      type: String,
      required: [true, 'FEN position string is required'],
      trim: true,
    },
    solutionMoves: {
      type: [String],
      required: [true, 'Solution move sequence is required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Puzzle must contain at least one solution move',
      },
    },
    theme: {
      type: String,
      enum: {
        values: [
          'FORK',
          'PIN',
          'SKEWER',
          'CHECKMATE',
          'DEFLECTION',
          'PATTERN_RECOGNITION',
        ],
        message: '{VALUE} is not a valid puzzle theme',
      },
      required: [true, 'Theme is required'],
      index: true,
    },
    difficulty: {
      type: Number,
      required: [true, 'Puzzle difficulty rating is required'],
      min: [300, 'Difficulty rating cannot be below 300'],
      max: [2500, 'Difficulty rating cannot exceed 2500'],
      index: true,
    },
    hint: {
      type: String,
      required: [true, 'Hint is required for young players'],
      trim: true,
      maxlength: [300, 'Hint cannot exceed 300 characters'],
    },
    xpReward: {
      type: Number,
      default: 20,
      min: [0, 'XP reward cannot be negative'],
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Puzzle: Model<IPuzzle> = model<IPuzzle>('Puzzle', puzzleSchema);

