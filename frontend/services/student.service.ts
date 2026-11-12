import { apiClient } from '../lib/api';
import { StudentDashboardResponse, DailyChallengeDTO } from '../types/student.types';

export const StudentService = {
  /**
   * Fetch complete student dashboard data
   */
  async getDashboard(): Promise<StudentDashboardResponse> {
    return apiClient<StudentDashboardResponse>('/students/dashboard');
  },

  /**
   * Fetch today's daily challenge
   */
  async getDailyChallenge(): Promise<{
    success: boolean;
    challenge: DailyChallengeDTO | null;
    message?: string;
  }> {
    return apiClient<{
      success: boolean;
      challenge: DailyChallengeDTO | null;
      message?: string;
    }>('/students/daily-challenge');
  },
};

