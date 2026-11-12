'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Trophy,
  Filter,
  CheckCircle2,
  RefreshCw,
  LayoutDashboard,
  Award,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LessonService } from '@/services/lesson.service';
import { LessonSummaryDTO } from '@/types/lesson.types';
import { LessonCard } from '@/components/lesson/LessonCard';

const CATEGORIES = [
  { id: 'ALL', label: 'All Subjects' },
  { id: 'CHESS_BASICS', label: 'Basics' },
  { id: 'PIECE_MOVEMENT', label: 'Pieces' },
  { id: 'OPENINGS', label: 'Openings' },
  { id: 'TACTICS', label: 'Tactics' },
  { id: 'ENDGAMES', label: 'Endgames' },
  { id: 'PATTERN_RECOGNITION', label: 'Patterns' },
  { id: 'STRATEGY', label: 'Strategy' },
];

export default function LearnCurriculumPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [lessons, setLessons] = useState<LessonSummaryDTO[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  // Load Lessons
  const loadLessons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filter = selectedCategory !== 'ALL' ? { category: selectedCategory } : undefined;
      const res = await LessonService.getLessons(filter);
      if (res.success) {
        setLessons(res.lessons);
      } else {
        setError('Failed to load curriculum lessons.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching lessons.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (user) {
      loadLessons();
    }
  }, [user, loadLessons]);

  const completedCount = lessons.filter((l) => l.isCompleted).length;
  const progressPercent =
    lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Return to Dashboard"
            >
              <LayoutDashboard className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-sm">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">
                Academy Curriculum
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/puzzles"
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              Tactical Puzzles
            </Link>
            <Link
              href="/play"
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors"
            >
              Practice Engine
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Hero Card */}
        <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-brand-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Progressive Mastery Pathway</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Chess Curriculum for Young Champions
            </h2>
            <p className="text-sm sm:text-base text-brand-100 leading-relaxed font-medium">
              Each lesson breaks down grandmaster concepts into bite-sized, interactive steps.
              Master the fundamentals, unlock next tiers, and build lifelong strategic thinking.
            </p>
          </div>

          {/* Progress overview */}
          <div className="mt-8 pt-6 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Award className="w-6 h-6 text-amber-300" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-200">
                  Your Journey
                </p>
                <p className="text-sm font-black">
                  {completedCount} of {lessons.length} Lessons Mastered ({progressPercent}%)
                </p>
              </div>
            </div>

            <div className="w-full sm:w-64 h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-400">
              <Filter className="w-4 h-4" />
              <span>Subject Filter</span>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Showing {lessons.length} Modules
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
                    active
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25 scale-105'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="p-8 bg-white rounded-3xl border border-rose-200 text-center space-y-4">
            <p className="text-sm font-bold text-rose-600">{error}</p>
            <button
              onClick={loadLessons}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Lesson Roadmap List */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <LessonCard key={lesson._id} lesson={lesson} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && lessons.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">No Lessons Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no lessons available for this subject filter yet.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
