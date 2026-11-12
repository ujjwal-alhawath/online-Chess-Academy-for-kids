export type LessonCategory =
  | 'CHESS_BASICS'
  | 'PIECE_MOVEMENT'
  | 'OPENINGS'
  | 'TACTICS'
  | 'ENDGAMES'
  | 'PATTERN_RECOGNITION'
  | 'STRATEGY';

export type LessonDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface LessonStep {
  stepNumber: number;
  type: 'TEXT' | 'INTERACTIVE_BOARD' | 'MULTIPLE_CHOICE';
  text?: string;
  fen?: string;
  interactiveMove?: {
    from: string;
    to: string;
    promotion?: string;
  };
  question?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

export interface LessonSummaryDTO {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: LessonCategory;
  difficulty: LessonDifficulty;
  order: number;
  xpReward: number;
  isCompleted: boolean;
  status: string;
  isLocked: boolean;
  score: number;
}

export interface LessonDetailDTO {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: LessonCategory;
  difficulty: LessonDifficulty;
  order: number;
  xpReward: number;
  content: LessonStep[];
}

export interface LessonDetailResponse {
  success: boolean;
  lesson: LessonDetailDTO;
  isCompleted: boolean;
  isLocked: boolean;
  currentStep: number;
  score: number;
}
