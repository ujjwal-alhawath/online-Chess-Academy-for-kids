import { Schema, model, Document, Model, Types } from 'mongoose';

export interface IStudentLessonProgress extends Document {
  studentId: Types.ObjectId;
  lessonId: Types.ObjectId;
  isCompleted: boolean;
  score: number;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const studentLessonProgressSchema = new Schema<IStudentLessonProgress>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: [true, 'Student reference is required'],
      index: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'Lesson reference is required'],
      index: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    score: {
      type: Number,
      default: 0,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100'],
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

// Prevent duplicate progress records for the same student and lesson
studentLessonProgressSchema.index(
  { studentId: 1, lessonId: 1 },
  { unique: true }
);

export const StudentLessonProgress: Model<IStudentLessonProgress> =
  model<IStudentLessonProgress>(
    'StudentLessonProgress',
    studentLessonProgressSchema
  );

