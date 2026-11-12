import { Schema, model, Document, Model, Types } from 'mongoose';

export interface ITeacherProfile extends Document {
  userId: Types.ObjectId;
  displayName: string;
  title: string;
  bio: string;
  createdAt: Date;
  updatedAt: Date;
}

const teacherProfileSchema = new Schema<ITeacherProfile>(
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
      maxlength: [50, 'Display name cannot exceed 50 characters'],
    },
    title: {
      type: String,
      default: 'Chess Instructor',
      trim: true,
      maxlength: [60, 'Title cannot exceed 60 characters'],
    },
    bio: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

export const TeacherProfile: Model<ITeacherProfile> = model<ITeacherProfile>(
  'TeacherProfile',
  teacherProfileSchema
);
