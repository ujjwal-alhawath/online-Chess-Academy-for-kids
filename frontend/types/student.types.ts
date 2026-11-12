export interface XpProgress {
  currentLevel: number;
  totalXp: number;
  xpInCurrentLevel: number;
  xpRequiredForNextLevel: number;
  percentage: number;
  xpRemaining: number;
}

export interface StudentStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDrawn: number;
  puzzlesSolved: number;
}

export interface StudentStreak {
  current: number;
  longest: number;
  lastActiveDate: string | null;
}

export interface StudentSummary {
  id: string;
  displayName: string;
  avatar: string;
  rating: number;
  level: number;
  xp: number;
  xpProgress: XpProgress;
  streak: StudentStreak;
  stats: StudentStats;
  parentLinkCode?: string;
}

export interface DailyChallengeDTO {
  date: string;
  title: string;
  description: string;
  type: string;
  targetCount: number;
  xpReward: number;
}

export interface BadgeDTO {
  badgeCode: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export interface LearningProgressItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  order: number;
  xpReward: number;
  isCompleted: boolean;
  score: number;
}

export interface RecentActivityItem {
  id: string;
  type: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface StudentDashboardResponse {
  success: boolean;
  student: StudentSummary;
  dailyChallenge: DailyChallengeDTO | null;
  badges: BadgeDTO[];
  learningProgress: LearningProgressItem[];
  recentActivity: RecentActivityItem[];
}

