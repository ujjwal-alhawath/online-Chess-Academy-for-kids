import { Schema, model, Document, Model, Types } from 'mongoose';

export type LessonCategory =
  | 'CHESS_BASICS'
  | 'PIECE_MOVEMENT'
  | 'OPENINGS'
  | 'TACTICS'
  | 'ENDGAMES'
  | 'PATTERN_RECOGNITION'
  | 'STRATEGY';

export type LessonDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type LessonStepType = 'TEXT' | 'INTERACTIVE_BOARD' | 'MULTIPLE_CHOICE';

export interface ILessonStep {
  stepNumber: number;
  type: LessonStepType;
  text?: string;
  fen?: string;
  interactiveMove?: {
    from: string;
    to: string;
    promotion?: string;
  };
  question?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

export interface ILesson extends Document {
  title: string;
  slug: string;
  description: string;
  category: LessonCategory;
  difficulty: LessonDifficulty;
  order: number;
  content: ILessonStep[];
  xpReward: number;
  createdBy: Types.ObjectId | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const lessonStepSchema = new Schema<ILessonStep>(
  {
    stepNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    type: {
      type: String,
      enum: ['TEXT', 'INTERACTIVE_BOARD', 'MULTIPLE_CHOICE'],
      required: true,
    },
    text: {
      type: String,
      trim: true,
    },
    fen: {
      type: String,
      trim: true,
    },
    interactiveMove: {
      from: { type: String, trim: true },
      to: { type: String, trim: true },
      promotion: { type: String, trim: true },
    },
    question: {
      type: String,
      trim: true,
    },
    options: [{ type: String, trim: true }],
    correctAnswer: {
      type: String,
      trim: true,
    },
    explanation: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const lessonSchema = new Schema<ILesson>(
  {
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Lesson slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Lesson description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      enum: {
        values: [
          'CHESS_BASICS',
          'PIECE_MOVEMENT',
          'OPENINGS',
          'TACTICS',
          'ENDGAMES',
          'PATTERN_RECOGNITION',
          'STRATEGY',
        ],
        message: '{VALUE} is not a valid lesson category',
      },
      required: [true, 'Category is required'],
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      default: 'BEGINNER',
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    content: {
      type: [lessonStepSchema],
      default: [],
    },
    xpReward: {
      type: Number,
      default: 50,
      min: [0, 'XP reward cannot be negative'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

export const Lesson: Model<ILesson> = model<ILesson>('Lesson', lessonSchema);

