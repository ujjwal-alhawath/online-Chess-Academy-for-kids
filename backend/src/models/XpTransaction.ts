import { Schema, model, Document, Model, Types } from 'mongoose';

export type XpSourceType =
  | 'LESSON_COMPLETION'
  | 'PUZZLE_SOLVE'
  | 'AI_GAME_FINISH'
  | 'AI_GAME_WIN'
  | 'DAILY_CHALLENGE'
  | 'MANUAL_AWARD';

export interface IXpTransaction extends Document {
  studentId: Types.ObjectId;
  amount: number;
  reason: string;
  sourceType?: XpSourceType;
  sourceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const xpTransactionSchema = new Schema<IXpTransaction>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: [true, 'Student profile reference is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'XP amount is required'],
      min: [1, 'XP amount must be at least 1'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for XP award is required'],
      trim: true,
      maxlength: [200, 'Reason cannot exceed 200 characters'],
    },
    sourceType: {
      type: String,
      enum: [
        'LESSON_COMPLETION',
        'PUZZLE_SOLVE',
        'AI_GAME_FINISH',
        'AI_GAME_WIN',
        'DAILY_CHALLENGE',
        'MANUAL_AWARD',
      ],
      index: true,
    },
    sourceId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee idempotency when sourceType & sourceId are provided
xpTransactionSchema.index(
  { studentId: 1, sourceType: 1, sourceId: 1 },
  { unique: true, sparse: true }
);

// Chronological activity index
xpTransactionSchema.index({ studentId: 1, createdAt: -1 });

export const XpTransaction: Model<IXpTransaction> = model<IXpTransaction>(
  'XpTransaction',
  xpTransactionSchema
);

