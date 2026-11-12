import { Schema, model, Document, Model, Types } from 'mongoose';

export type TournamentStatus =
  | 'UPCOMING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ITournament extends Document {
  name: string;
  description: string;
  organizerId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  timeControl: string;
  status: TournamentStatus;
  maxParticipants: number;
  createdAt: Date;
  updatedAt: Date;
}

const tournamentSchema = new Schema<ITournament>(
  {
    name: {
      type: String,
      required: [true, 'Tournament name is required'],
      trim: true,
      minlength: [3, 'Tournament name must be at least 3 characters'],
      maxlength: [100, 'Tournament name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer reference is required'],
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    timeControl: {
      type: String,
      required: [true, 'Time control is required (e.g. 10+0)'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
        message: '{VALUE} is not a valid tournament status',
      },
      default: 'UPCOMING',
      index: true,
    },
    maxParticipants: {
      type: Number,
      default: 32,
      min: [2, 'Tournament must allow at least 2 participants'],
      max: [256, 'Tournament participants cannot exceed 256'],
    },
  },
  {
    timestamps: true,
  }
);

export const Tournament: Model<ITournament> = model<ITournament>(
  'Tournament',
  tournamentSchema
);
