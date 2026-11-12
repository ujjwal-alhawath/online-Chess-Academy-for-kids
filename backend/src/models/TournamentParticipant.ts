import { Schema, model, Document, Model, Types } from 'mongoose';

export interface ITournamentParticipant extends Document {
  tournamentId: Types.ObjectId;
  studentId: Types.ObjectId;
  score: number;
  rank: number | null;
  tiebreak: number;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tournamentParticipantSchema = new Schema<ITournamentParticipant>(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: 'Tournament',
      required: [true, 'Tournament reference is required'],
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: [true, 'Student profile reference is required'],
      index: true,
    },
    score: {
      type: Number,
      default: 0,
      min: [0, 'Tournament score cannot be negative'],
    },
    rank: {
      type: Number,
      default: null,
    },
    tiebreak: {
      type: Number,
      default: 0,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate participant registrations in the same tournament
tournamentParticipantSchema.index(
  { tournamentId: 1, studentId: 1 },
  { unique: true }
);

// Ranking sort index
tournamentParticipantSchema.index({ tournamentId: 1, score: -1, tiebreak: -1 });

export const TournamentParticipant: Model<ITournamentParticipant> =
  model<ITournamentParticipant>(
    'TournamentParticipant',
    tournamentParticipantSchema
  );

