import { Schema, model, Document, Model } from 'mongoose';

export type BadgeCategory =
  | 'PUZZLES'
  | 'GAMES'
  | 'STREAKS'
  | 'LESSONS'
  | 'SPORTSMANSHIP';

export interface IBadge extends Document {
  badgeCode: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  createdAt: Date;
  updatedAt: Date;
}

const badgeSchema = new Schema<IBadge>(
  {
    badgeCode: {
      type: String,
      required: [true, 'Badge code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Badge name is required'],
      trim: true,
      maxlength: [60, 'Badge name cannot exceed 60 characters'],
    },
    description: {
      type: String,
      required: [true, 'Badge description is required'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    icon: {
      type: String,
      required: [true, 'Badge icon is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: ['PUZZLES', 'GAMES', 'STREAKS', 'LESSONS', 'SPORTSMANSHIP'],
        message: '{VALUE} is not a valid badge category',
      },
      required: [true, 'Badge category is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Badge: Model<IBadge> = model<IBadge>('Badge', badgeSchema);
