import { Schema, model, Document, Model, Types } from 'mongoose';

/**
 * Educational Self-Reflection Model
 * NOTE: This data represents voluntary, non-clinical student self-reflection
 * designed strictly to encourage persistence, sportsmanship, and growth mindset.
 * It is NOT a clinical, psychological, or diagnostic assessment.
 */

export type ReflectionMood =
  | 'HAPPY'
  | 'CONFIDENT'
  | 'OKAY'
  | 'NERVOUS'
  | 'FRUSTRATED'
  | 'DISAPPOINTED';

export type ReflectionEventTag =
  | 'MADE_MISTAKE'
  | 'LOST_PIECE'
  | 'STRONG_OPPONENT'
  | 'BECAME_NERVOUS'
  | 'STAYED_CALM'
  | 'GREAT_MOVE';

export interface IEmotionReflection extends Document {
  studentId: Types.ObjectId;
  gameId: Types.ObjectId;
  mood: ReflectionMood;
  eventTag: ReflectionEventTag;
  didWell: string;
  lessonLearned: string;
  nextGoal: string;
  createdAt: Date;
  updatedAt: Date;
}

const emotionReflectionSchema = new Schema<IEmotionReflection>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: [true, 'Student profile reference is required'],
      index: true,
    },
    gameId: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
      required: [true, 'Game reference is required'],
      index: true,
    },
    mood: {
      type: String,
      enum: {
        values: [
          'HAPPY',
          'CONFIDENT',
          'OKAY',
          'NERVOUS',
          'FRUSTRATED',
          'DISAPPOINTED',
        ],
        message: '{VALUE} is not a valid reflection mood',
      },
      required: [true, 'Reflection mood is required'],
    },
    eventTag: {
      type: String,
      enum: {
        values: [
          'MADE_MISTAKE',
          'LOST_PIECE',
          'STRONG_OPPONENT',
          'BECAME_NERVOUS',
          'STAYED_CALM',
          'GREAT_MOVE',
        ],
        message: '{VALUE} is not a valid event tag',
      },
      required: [true, 'Event tag is required'],
    },
    didWell: {
      type: String,
      default: '',
      trim: true,
      maxlength: [300, 'Self-reflection cannot exceed 300 characters'],
    },
    lessonLearned: {
      type: String,
      default: '',
      trim: true,
      maxlength: [300, 'Lesson learned cannot exceed 300 characters'],
    },
    nextGoal: {
      type: String,
      default: '',
      trim: true,
      maxlength: [300, 'Next goal cannot exceed 300 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for chronological reflection timeline by student
emotionReflectionSchema.index({ studentId: 1, createdAt: -1 });

export const EmotionReflection: Model<IEmotionReflection> =
  model<IEmotionReflection>('EmotionReflection', emotionReflectionSchema);
