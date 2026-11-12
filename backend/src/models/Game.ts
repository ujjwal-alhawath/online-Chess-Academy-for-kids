import { Schema, model, Document, Model, Types } from 'mongoose';

export type GameMode = 'AI' | 'MULTIPLAYER' | 'TOURNAMENT' | 'PRACTICE';
export type AiLevel = 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD' | 'ADVANCED';
export type GameResult = 'WHITE_WON' | 'BLACK_WON' | 'DRAW' | 'IN_PROGRESS';
export type TerminationReason =
  | 'CHECKMATE'
  | 'RESIGNATION'
  | 'TIMEOUT'
  | 'STALEMATE'
  | 'DRAW_AGREED'
  | 'ABANDONED';

export interface IGameMove {
  moveNumber: number;
  from: string;
  to: string;
  piece: string;
  san: string;
  timeRemaining?: number;
}

export interface ITimeControl {
  initialMinutes: number;
  incrementSeconds: number;
}

export interface IGame extends Document {
  whitePlayerId: Types.ObjectId | null;
  blackPlayerId: Types.ObjectId | null;
  whiteIsAI: boolean;
  blackIsAI: boolean;
  aiLevel: AiLevel | null;
  gameMode: GameMode;
  timeControl: ITimeControl;
  initialFen: string;
  currentFen: string;
  moves: IGameMove[];
  pgn: string;
  result: GameResult;
  terminationReason: TerminationReason | null;
  tournamentId: Types.ObjectId | null;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const gameMoveSchema = new Schema<IGameMove>(
  {
    moveNumber: { type: Number, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    piece: { type: String, required: true },
    san: { type: String, required: true },
    timeRemaining: { type: Number },
  },
  { _id: false }
);

const timeControlSchema = new Schema<ITimeControl>(
  {
    initialMinutes: { type: Number, default: 10, min: 1 },
    incrementSeconds: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const gameSchema = new Schema<IGame>(
  {
    whitePlayerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    blackPlayerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    whiteIsAI: {
      type: Boolean,
      default: false,
    },
    blackIsAI: {
      type: Boolean,
      default: false,
    },
    aiLevel: {
      type: String,
      enum: ['BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'ADVANCED', null],
      default: null,
    },
    gameMode: {
      type: String,
      enum: ['AI', 'MULTIPLAYER', 'TOURNAMENT', 'PRACTICE'],
      default: 'AI',
      required: true,
      index: true,
    },
    timeControl: {
      type: timeControlSchema,
      default: () => ({ initialMinutes: 10, incrementSeconds: 0 }),
    },
    initialFen: {
      type: String,
      default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    },
    currentFen: {
      type: String,
      default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    },
    moves: {
      type: [gameMoveSchema],
      default: [],
    },
    pgn: {
      type: String,
      default: '',
    },
    result: {
      type: String,
      enum: ['WHITE_WON', 'BLACK_WON', 'DRAW', 'IN_PROGRESS'],
      default: 'IN_PROGRESS',
      index: true,
    },
    terminationReason: {
      type: String,
      enum: [
        'CHECKMATE',
        'RESIGNATION',
        'TIMEOUT',
        'STALEMATE',
        'DRAW_AGREED',
        'ABANDONED',
        null,
      ],
      default: null,
    },
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: 'Tournament',
      default: null,
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
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

gameSchema.index({ createdAt: -1 });

export const Game: Model<IGame> = model<IGame>('Game', gameSchema);
