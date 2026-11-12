export type PuzzleTheme =
  | 'FORK'
  | 'PIN'
  | 'SKEWER'
  | 'CHECKMATE'
  | 'DEFLECTION'
  | 'PATTERN_RECOGNITION'
  | 'DISCOVERED_ATTACK'
  | 'DOUBLE_ATTACK'
  | 'MATE_IN_ONE'
  | 'MATE_IN_TWO'
  | 'TACTICAL';

export interface PuzzleDTO {
  _id: string;
  title: string;
  description?: string;
  fen: string;
  theme: PuzzleTheme;
  difficulty: number;
  hint: string;
  hints?: string[];
  explanation?: string;
  xpReward: number;
  order?: number;
}

export interface PuzzleStartResponse {
  success: boolean;
  attemptId: string;
  puzzle: {
    id: string;
    title: string;
    theme: PuzzleTheme;
    difficulty: number;
    hint: string;
    hints?: string[];
    xpReward: number;
    fen: string;
  };
  currentFen: string;
  currentMoveIndex: number;
}

export interface PuzzleMoveResponse {
  success: boolean;
  correct: boolean;
  gameOver: boolean;
  feedback: string;
  fen: string;
  moveNumber: number;
  mistakes: number;
  score?: number;
  xpAwarded?: number;
  opponentMove?: {
    from: string;
    to: string;
    san: string;
  };
}

export interface PuzzleHintResponse {
  success: boolean;
  hint: string;
  hintsUsed: number;
  hintIndex: number;
}

export interface PuzzleAttemptRecord {
  _id: string;
  puzzleId: {
    _id: string;
    title: string;
    theme: PuzzleTheme;
    difficulty: number;
    xpReward: number;
  };
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'ABANDONED';
  solved: boolean;
  score: number;
  mistakes: number;
  hintsUsed: number;
  createdAt: string;
}

export interface PuzzleListResponse {
  success: boolean;
  puzzles: PuzzleDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

