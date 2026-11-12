import { Schema, model, Document, Model, Types } from 'mongoose';

export interface INotificationPreferences {
  emailAlerts: boolean;
  weeklyProgressReport: boolean;
  streakReminders: boolean;
}

export interface IParentProfile extends Document {
  userId: Types.ObjectId;
  displayName: string;
  linkedStudentIds: Types.ObjectId[];
  notificationPreferences: INotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const parentProfileSchema = new Schema<IParentProfile>(
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
    linkedStudentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'StudentProfile',
      },
    ],
    notificationPreferences: {
      emailAlerts: {
        type: Boolean,
        default: true,
      },
      weeklyProgressReport: {
        type: Boolean,
        default: true,
      },
      streakReminders: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const ParentProfile: Model<IParentProfile> = model<IParentProfile>(
  'ParentProfile',
  parentProfileSchema
);
