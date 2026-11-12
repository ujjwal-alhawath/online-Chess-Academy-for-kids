import { Schema, model, Document, Model, Types } from 'mongoose';

export type PuzzleTheme =
  | 'FORK'
  | 'PIN'
  | 'SKEWER'
  | 'CHECKMATE'
  | 'DEFLECTION'
  | 'PATTERN_RECOGNITION'
  | 'DISCOVERED_ATTACK'
  | 'DOUBLE_ATTACK'
  | 'MATE_IN_ONE'
  | 'MATE_IN_TWO'
  | 'TACTICAL';

export interface IPuzzle extends Document {
  title: string;
  description?: string;
  fen: string;
  solutionMoves: string[];
  theme: PuzzleTheme;
  difficulty: number;
  hint: string;
  hints?: string[];
  explanation?: string;
  lessonId?: Types.ObjectId | null;
  order?: number;
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
    description: {
      type: String,
      trim: true,
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
          'DISCOVERED_ATTACK',
          'DOUBLE_ATTACK',
          'MATE_IN_ONE',
          'MATE_IN_TWO',
          'TACTICAL',
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
    hints: [{ type: String, trim: true }],
    explanation: {
      type: String,
      trim: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      default: null,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
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

