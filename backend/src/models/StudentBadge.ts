import { Schema, model, Document, Model, Types } from 'mongoose';

export interface IStudentBadge extends Document {
  studentId: Types.ObjectId;
  badgeCode: string;
  unlockedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const studentBadgeSchema = new Schema<IStudentBadge>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: [true, 'Student reference is required'],
      index: true,
    },
    badgeCode: {
      type: String,
      required: [true, 'Badge code is required'],
      uppercase: true,
      trim: true,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate badge unlocks for the same student
studentBadgeSchema.index({ studentId: 1, badgeCode: 1 }, { unique: true });

export const StudentBadge: Model<IStudentBadge> = model<IStudentBadge>(
  'StudentBadge',
  studentBadgeSchema
);

