export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type BoardOrientation = 'white' | 'black';

export type GameStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'CHECKMATE'
  | 'STALEMATE'
  | 'DRAW'
  | 'RESIGNED'
  | 'ABANDONED';

export type AiDifficulty = 'BEGINNER' | 'MEDIUM' | 'HARD';

export interface MoveHistoryItem {
  moveNumber: number;
  from: string;
  to: string;
  piece: string;
  san: string;
  promotion?: string;
}

export interface ChessGameState {
  gameId?: string;
  fen: string;
  pgn: string;
  turn: PieceColor;
  status: GameStatus;
  playerColor: BoardOrientation;
  selectedSquare: string | null;
  legalMoves: string[];
  lastMove?: {
    from: string;
    to: string;
    san: string;
  };
  inCheck: boolean;
  checkSquare: string | null;
}

export interface GameDTO {
  _id: string;
  whitePlayerId: { _id: string; username: string } | null;
  blackPlayerId: { _id: string; username: string } | null;
  whiteIsAI: boolean;
  blackIsAI: boolean;
  aiLevel: AiDifficulty | null;
  gameMode: 'AI' | 'MULTIPLAYER' | 'PRACTICE';
  initialFen: string;
  currentFen: string;
  moves: MoveHistoryItem[];
  pgn: string;
  result: 'WHITE_WON' | 'BLACK_WON' | 'DRAW' | 'IN_PROGRESS';
  terminationReason: string | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
}

export interface CreateGamePayload {
  gameMode?: 'AI' | 'PRACTICE' | 'MULTIPLAYER';
  aiLevel?: AiDifficulty;
  playerColor?: 'white' | 'black' | 'random';
  timeControl?: {
    initialMinutes?: number;
    incrementSeconds?: number;
  };
}

export interface MakeMovePayload {
  from: string;
  to: string;
  promotion?: 'q' | 'r' | 'b' | 'n';
}

export interface MakeMoveResponse {
  success: boolean;
  message?: string;
  game: GameDTO;
  move: {
    san: string;
    from: string;
    to: string;
    piece: string;
    promotion?: string;
  };
  isTerminal: boolean;
  result: string;
}

export interface GameHistoryResponse {
  success: boolean;
  games: GameDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

