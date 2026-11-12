'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Crown,
  LogOut,
  Shield,
  GraduationCap,
  Sparkles,
  Link2,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Flame,
  Award,
  Swords,
  Puzzle,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { StudentService } from '@/services/student.service';
import { StudentDashboardResponse } from '@/types/student.types';
import {
  StudentHeader,
  StatCard,
  XPProgress,
  StreakCard,
  DailyChallenge,
  LearningPath,
  BadgeShowcase,
  RecentActivity,
  ParentLinkCard,
} from '@/components/dashboard';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, profile, isLoading: isAuthLoading, logout, linkParent } = useAuth();

  // Dashboard Data State
  const [dashboardData, setDashboardData] = useState<StudentDashboardResponse | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Parent Linking Form State (for PARENT role view)
  const [parentCodeInput, setParentCodeInput] = useState('');
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);

  // Fetch student dashboard data
  const loadDashboard = useCallback(async () => {
    if (!user || user.role !== 'STUDENT') {
      setIsDataLoading(false);
      return;
    }

    try {
      setIsDataLoading(true);
      setLoadError(null);
      const res = await StudentService.getDashboard();
      if (res.success) {
        setDashboardData(res);
      } else {
        setLoadError('Failed to load dashboard data from academy server.');
      }
    } catch (err: unknown) {
      setLoadError(
        err instanceof Error ? err.message : 'Could not connect to academy server.'
      );
    } finally {
      setIsDataLoading(false);
    }
  }, [user]);

  // Auth Guard
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  // Trigger dashboard fetch when student user is ready
  useEffect(() => {
    if (user && user.role === 'STUDENT') {
      loadDashboard();
    } else if (user) {
      setIsDataLoading(false);
    }
  }, [user, loadDashboard]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err: unknown) {
      console.error('Logout error:', err);
    }
  };

  const handleParentLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkSuccess(null);
    setLinkError(null);

    if (!parentCodeInput.trim()) {
      setLinkError('Please enter an 8-character parent link code.');
      return;
    }

    try {
      setIsLinking(true);
      const res = await linkParent(parentCodeInput.trim());
      setLinkSuccess(res.message || 'Student linked successfully!');
      setParentCodeInput('');
    } catch (err: unknown) {
      setLinkError(
        err instanceof Error ? err.message : 'Failed to link student. Please verify the code.'
      );
    } finally {
      setIsLinking(false);
    }
  };

  // 1. Full-page Auth Verification Loader
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto shadow-md" />
          <p className="text-sm font-bold text-slate-700">Connecting to Chess Academy...</p>
        </div>
      </div>
    );
  }

  // Not authenticated; redirect will fire in useEffect
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Crown className="w-5 h-5 fill-current text-amber-300" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-lg leading-tight block">
                Kids Chess <span className="text-brand-600">Academy</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 block -mt-0.5">
                Think Strategically • Play Boldly
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/learn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Curriculum</span>
            </Link>

            <Link
              href="/puzzles"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              <Puzzle className="w-3.5 h-3.5" />
              <span>Tactics</span>
            </Link>

            <Link
              href="/play"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition-colors"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Play Chess</span>
            </Link>

            <Link
              href="/games"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              <span>History</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{user.role}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-900 font-extrabold">{user.username}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* ============================================================== */}
        {/* ROLE VIEW: STUDENT                                            */}
        {/* ============================================================== */}
        {user.role === 'STUDENT' && (
          <>
            {/* Loading Skeleton */}
            {isDataLoading && (
              <div className="space-y-6 animate-pulse">
                <div className="h-44 bg-slate-200 rounded-3xl" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="h-28 bg-slate-200 rounded-2xl" />
                  <div className="h-28 bg-slate-200 rounded-2xl" />
                  <div className="h-28 bg-slate-200 rounded-2xl" />
                  <div className="h-28 bg-slate-200 rounded-2xl" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 h-48 bg-slate-200 rounded-3xl" />
                  <div className="h-48 bg-slate-200 rounded-3xl" />
                </div>
              </div>
            )}

            {/* Error State */}
            {!isDataLoading && loadError && (
              <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="font-black text-slate-900 text-lg">Unable to Load Dashboard</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">{loadError}</p>
                <button
                  onClick={loadDashboard}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Connection</span>
                </button>
              </div>
            )}

            {/* Live Student Dashboard */}
            {!isDataLoading && dashboardData && (
              <div className="space-y-8">
                {/* 1. Header Banner */}
                <StudentHeader
                  displayName={dashboardData.student.displayName}
                  avatar={dashboardData.student.avatar}
                  rating={dashboardData.student.rating}
                  level={dashboardData.student.level}
                />

                {/* 2. Key Metrics Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <StatCard
                    title="Academy Rating"
                    value={dashboardData.student.rating}
                    subtitle={
                      dashboardData.student.rating < 800
                        ? 'Pawn Explorer'
                        : dashboardData.student.rating < 1200
                        ? 'Knight Tactician'
                        : 'Bishop Strategist'
                    }
                    icon={Trophy}
                    color="brand"
                    badge="Rapid"
                  />
                  <Link href="/play" className="block transition-transform hover:scale-[1.02]">
                    <StatCard
                      title="Games Played"
                      value={dashboardData.student.stats.gamesPlayed}
                      subtitle={
                        dashboardData.student.stats.gamesPlayed > 0
                          ? `${Math.round(
                              (dashboardData.student.stats.gamesWon /
                                dashboardData.student.stats.gamesPlayed) *
                                100
                            )}% Win Rate`
                          : '0 Wins • Ready to play'
                      }
                      icon={Swords}
                      color="amber"
                    />
                  </Link>
                  <Link href="/puzzles" className="block transition-transform hover:scale-[1.02]">
                    <StatCard
                      title="Puzzles Solved"
                      value={dashboardData.student.stats.puzzlesSolved}
                      subtitle="+25 XP per tactic"
                      icon={Puzzle}
                      color="emerald"
                    />
                  </Link>
                  <StatCard
                    title="Active Streak"
                    value={`${dashboardData.student.streak.current} Days`}
                    subtitle={`Record: ${dashboardData.student.streak.longest} Days`}
                    icon={Flame}
                    color="rose"
                    badge="🔥 Daily"
                  />
                </div>

                {/* 3. Core Gamification: XP Progress + Streak Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <XPProgress xpProgress={dashboardData.student.xpProgress} />
                  </div>
                  <div>
                    <StreakCard streak={dashboardData.student.streak} />
                  </div>
                </div>

                {/* 4. Daily Quest & Parent Link Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <DailyChallenge challenge={dashboardData.dailyChallenge} />
                  <ParentLinkCard parentLinkCode={dashboardData.student.parentLinkCode} />
                </div>

                {/* 5. Structured Learning Path */}
                <LearningPath learningProgress={dashboardData.learningProgress} />

                {/* 6. Trophy Case & Real-Time Activity Stream */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <BadgeShowcase badges={dashboardData.badges} />
                  </div>
                  <div>
                    <RecentActivity activities={dashboardData.recentActivity} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ============================================================== */}
        {/* ROLE VIEW: PARENT PLACEHOLDER & LINKING CARD                   */}
        {/* ============================================================== */}
        {user.role === 'PARENT' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Parent & Guardian Portal</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Monitor your child&apos;s chess thinking, habits, and emotional regulation
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                Welcome to the Kids Chess Academy family portal. Comprehensive parent analytics, weekly strategic reports, and screen time monitoring will unlock in Phase 10. You can link your student&apos;s account below right now.
              </div>
            </div>

            {/* Parent-Student Linking Form */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-emerald-600" />
                  <span>Connect Your Child&apos;s Academy Account</span>
                </h3>
                <p className="text-xs text-slate-600">
                  Enter the 8-character code shown on your child&apos;s student dashboard (e.g. KIDS-XXXX).
                </p>
              </div>

              {linkSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>{linkSuccess}</span>
                </div>
              )}

              {linkError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  <span>{linkError}</span>
                </div>
              )}

              <form onSubmit={handleParentLinkSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={parentCodeInput}
                  onChange={(e) => setParentCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter 8-character code (e.g. KIDS-ABCD)"
                  maxLength={12}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl text-sm font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={isLinking}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50"
                >
                  {isLinking ? 'Linking...' : 'Connect Student'}
                </button>
              </form>

              {profile && 'linkedStudentIds' in profile && Array.isArray((profile as { linkedStudentIds: string[] }).linkedStudentIds) && (
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    {(profile as { linkedStudentIds: string[] }).linkedStudentIds.length} Student account(s) currently linked to this guardian profile.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ROLE VIEW: TEACHER PLACEHOLDER                                 */}
        {/* ============================================================== */}
        {user.role === 'TEACHER' && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Coach & Teacher Workspace</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Classroom cohorts, curriculum scheduling, and tournament directing
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 leading-relaxed font-medium">
              Welcome, Coach {user.username}! Teacher cohort management, lesson assignments, and tournament management tools will be implemented in Phases 8–10. Student learning analytics and classroom controls will be accessible here.
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ROLE VIEW: ADMIN PLACEHOLDER                                   */}
        {/* ============================================================== */}
        {user.role === 'ADMIN' && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Academy Administration</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Global academy configuration, user moderation, and curriculum management
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              System administrator session active. Platform oversight, audit logs, and curriculum editors will be delivered in Phase 11.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
