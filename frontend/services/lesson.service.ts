import { apiClient } from '../lib/api';
import { LessonSummaryDTO, LessonDetailResponse } from '../types/lesson.types';

export const LessonService = {
  /**
   * Fetch all lessons with unlocking state and student progress
   */
  async getLessons(params?: {
    category?: string;
    difficulty?: string;
  }): Promise<{ success: boolean; lessons: LessonSummaryDTO[] }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.difficulty) query.append('difficulty', params.difficulty);

    const qs = query.toString();
    return apiClient<{ success: boolean; lessons: LessonSummaryDTO[] }>(
      `/lessons${qs ? `?${qs}` : ''}`
    );
  },

  /**
   * Retrieve single lesson with steps and student completion
   */
  async getLesson(lessonId: string): Promise<LessonDetailResponse> {
    return apiClient<LessonDetailResponse>(`/lessons/${lessonId}`);
  },

  /**
   * Start or resume a lesson
   */
  async startLesson(lessonId: string): Promise<{ success: boolean; progress: unknown }> {
    return apiClient(`/lessons/${lessonId}/start`, {
      method: 'POST',
    });
  },

  /**
   * Submit answer for a lesson step
   */
  async submitStep(
    lessonId: string,
    stepNumber: number,
    answer: {
      selectedAnswer?: string;
      interactiveMove?: { from: string; to: string; promotion?: string };
    }
  ): Promise<{
    success: boolean;
    isCorrect: boolean;
    explanation?: string;
    nextStep: number;
    totalSteps: number;
  }> {
    return apiClient(`/lessons/${lessonId}/steps/${stepNumber}`, {
      method: 'POST',
      body: JSON.stringify(answer),
    });
  },

  /**
   * Complete lesson and claim XP
   */
  async completeLesson(lessonId: string): Promise<{
    success: boolean;
    xpAwarded: number;
    nextLessonId?: string;
  }> {
    return apiClient(`/lessons/${lessonId}/complete`, {
      method: 'POST',
    });
  },
};
