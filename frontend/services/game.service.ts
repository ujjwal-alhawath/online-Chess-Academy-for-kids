import { apiClient } from '../lib/api';
import {
  GameDTO,
  CreateGamePayload,
  MakeMovePayload,
  MakeMoveResponse,
  GameHistoryResponse,
} from '../types/chess.types';

export const GameService = {
  /**
   * Create a new game on the backend
   */
  async createGame(payload: CreateGamePayload): Promise<{ success: boolean; game: GameDTO }> {
    return apiClient<{ success: boolean; game: GameDTO }>('/games', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Retrieve game details by ID
   */
  async getGame(gameId: string): Promise<{ success: boolean; game: GameDTO }> {
    return apiClient<{ success: boolean; game: GameDTO }>(`/games/${gameId}`);
  },

  /**
   * Submit a player or AI move for authoritative validation & state persistence
   */
  async makeMove(gameId: string, payload: MakeMovePayload): Promise<MakeMoveResponse> {
    return apiClient<MakeMoveResponse>(`/games/${gameId}/moves`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Resign active game
   */
  async resign(gameId: string): Promise<{ success: boolean; game: GameDTO }> {
    return apiClient<{ success: boolean; game: GameDTO }>(`/games/${gameId}/resign`, {
      method: 'POST',
    });
  },

  /**
   * Fetch paginated student game history
   */
  async getHistory(page: number = 1, limit: number = 10): Promise<GameHistoryResponse> {
    return apiClient<GameHistoryResponse>(`/games/history?page=${page}&limit=${limit}`);
  },
};

