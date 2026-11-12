import { apiClient } from '../lib/api';
import {
  PuzzleListResponse,
  PuzzleDTO,
  PuzzleStartResponse,
  PuzzleMoveResponse,
  PuzzleHintResponse,
  PuzzleAttemptRecord,
} from '../types/puzzle.types';

export const PuzzleService = {
  /**
   * Fetch published puzzles with optional filtering and pagination
   */
  async getPuzzles(params?: {
    theme?: string;
    minDifficulty?: number;
    maxDifficulty?: number;
    lessonId?: string;
    page?: number;
    limit?: number;
  }): Promise<PuzzleListResponse> {
    const query = new URLSearchParams();
    if (params?.theme) query.append('theme', params.theme);
    if (params?.minDifficulty) query.append('minDifficulty', params.minDifficulty.toString());
    if (params?.maxDifficulty) query.append('maxDifficulty', params.maxDifficulty.toString());
    if (params?.lessonId) query.append('lessonId', params.lessonId);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const qs = query.toString();
    return apiClient<PuzzleListResponse>(`/puzzles${qs ? `?${qs}` : ''}`);
  },

  /**
   * Retrieve single puzzle details (never includes solution moves)
   */
  async getPuzzle(puzzleId: string): Promise<{ success: boolean; puzzle: PuzzleDTO }> {
    return apiClient<{ success: boolean; puzzle: PuzzleDTO }>(`/puzzles/${puzzleId}`);
  },

  /**
   * Initialize a new attempt for the authenticated student
   */
  async startAttempt(puzzleId: string): Promise<PuzzleStartResponse> {
    return apiClient<PuzzleStartResponse>(`/puzzles/${puzzleId}/start`, {
      method: 'POST',
    });
  },

  /**
   * Submit a player move for authoritative server-side validation
   */
  async submitMove(
    attemptId: string,
    move: { from: string; to: string; promotion?: 'q' | 'r' | 'b' | 'n' }
  ): Promise<PuzzleMoveResponse> {
    return apiClient<PuzzleMoveResponse>(`/puzzles/attempts/${attemptId}/move`, {
      method: 'POST',
      body: JSON.stringify(move),
    });
  },

  /**
   * Request a progressive hint
   */
  async requestHint(attemptId: string): Promise<PuzzleHintResponse> {
    return apiClient<PuzzleHintResponse>(`/puzzles/attempts/${attemptId}/hint`, {
      method: 'POST',
    });
  },

  /**
   * Fetch authenticated student's previous attempts
   */
  async getMyAttempts(page: number = 1, limit: number = 10): Promise<{
    success: boolean;
    attempts: PuzzleAttemptRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return apiClient(`/puzzles/my-attempts?page=${page}&limit=${limit}`);
  },
};
