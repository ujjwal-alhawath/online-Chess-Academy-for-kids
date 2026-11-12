import { apiClient } from '../lib/api';

export interface UserSummary {
  id: string;
  username: string;
  email: string | null;
  role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN';
  createdAt: string;
}

export interface StudentProfileData {
  displayName: string;
  avatar: string;
  chessRating: number;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  gamesPlayed: number;
  gamesWon: number;
  puzzlesSolved: number;
  parentLinkCode?: string;
}

export interface ParentProfileData {
  displayName: string;
  linkedStudentIds: string[];
}

export interface TeacherProfileData {
  displayName: string;
  title: string;
  bio: string;
}

export type RoleProfile =
  | StudentProfileData
  | ParentProfileData
  | TeacherProfileData
  | { displayName?: string; [key: string]: unknown };

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: UserSummary;
  profile?: RoleProfile;
  linkedStudent?: {
    id: string;
    displayName: string;
    chessRating: number;
    level: number;
  };
}

export interface RegisterPayload {
  username: string;
  password: string;
  role: 'STUDENT' | 'TEACHER' | 'PARENT';
  displayName: string;
  email?: string;
  avatar?: string;
  title?: string;
  bio?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export const AuthService = {
  /**
   * Register a new account (STUDENT, PARENT, or TEACHER)
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Log in user using credentials; sets secure cookie
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Log out current user and clear session cookie
   */
  async logout(): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/logout', {
      method: 'POST',
    });
  },

  /**
   * Retrieve current user session and role profile
   */
  async getMe(): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/me', {
      method: 'GET',
    });
  },

  /**
   * Link child to parent account using student's parentLinkCode
   */
  async linkParent(parentLinkCode: string): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/link-parent', {
      method: 'POST',
      body: JSON.stringify({ parentLinkCode }),
    });
  },
};
