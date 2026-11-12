import { Schema, model, Document, Model, Types } from 'mongoose';

export type TournamentMatchStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'BYE';

export interface ITournamentMatch extends Document {
  tournamentId: Types.ObjectId;
  round: number;
  whitePlayerId: Types.ObjectId;
  blackPlayerId: Types.ObjectId;
  gameId: Types.ObjectId | null;
  result: string;
  status: TournamentMatchStatus;
  createdAt: Date;
  updatedAt: Date;
}

const tournamentMatchSchema = new Schema<ITournamentMatch>(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: 'Tournament',
      required: [true, 'Tournament reference is required'],
      index: true,
    },
    round: {
      type: Number,
      required: [true, 'Tournament round number is required'],
      min: [1, 'Round must be at least 1'],
    },
    whitePlayerId: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: [true, 'White player reference is required'],
    },
    blackPlayerId: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: [true, 'Black player reference is required'],
    },
    gameId: {
      type: Schema.Types.ObjectId,
      ref: 'Game',
      default: null,
      index: true,
    },
    result: {
      type: String,
      default: '*',
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BYE'],
        message: '{VALUE} is not a valid match status',
      },
      default: 'PENDING',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying round pairings in a tournament
tournamentMatchSchema.index({ tournamentId: 1, round: 1 });

export const TournamentMatch: Model<ITournamentMatch> = model<ITournamentMatch>(
  'TournamentMatch',
  tournamentMatchSchema
);
