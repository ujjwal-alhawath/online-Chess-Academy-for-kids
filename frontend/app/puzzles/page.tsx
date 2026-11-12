'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Puzzle as PuzzleIcon,
  Sparkles,
  Trophy,
  Filter,
  ArrowRight,
  Brain,
  Zap,
  Target,
  CheckCircle2,
  RefreshCw,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PuzzleService } from '@/services/puzzle.service';
import { PuzzleDTO, PuzzleAttemptRecord } from '@/types/puzzle.types';

const THEMES = [
  { id: 'ALL', label: 'All Tactics' },
  { id: 'FORK', label: 'Fork' },
  { id: 'PIN', label: 'Pin' },
  { id: 'SKEWER', label: 'Skewer' },
  { id: 'CHECKMATE', label: 'Checkmate' },
  { id: 'DEFLECTION', label: 'Deflection' },
  { id: 'PATTERN_RECOGNITION', label: 'Patterns' },
  { id: 'DISCOVERED_ATTACK', label: 'Discovered Attack' },
  { id: 'DOUBLE_ATTACK', label: 'Double Attack' },
  { id: 'TACTICAL', label: 'Tactical' },
];

export default function PuzzlesCatalogPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [puzzles, setPuzzles] = useState<PuzzleDTO[]>([]);
  const [attempts, setAttempts] = useState<PuzzleAttemptRecord[]>([]);
  const [selectedTheme, setSelectedTheme] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  // Load puzzles
  const loadPuzzles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filter = selectedTheme !== 'ALL' ? { theme: selectedTheme } : undefined;
      const res = await PuzzleService.getPuzzles(filter);
      if (res.success) {
        setPuzzles(res.puzzles);
      } else {
        setError('Failed to load puzzles.');
      }

      // Also fetch my attempts to mark solved puzzles
      try {
        const attemptsRes = await PuzzleService.getMyAttempts(1, 100);
        if (attemptsRes.success) {
          setAttempts(attemptsRes.attempts);
        }
      } catch {
        // Non-critical, ignore
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching puzzles.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTheme]);

  useEffect(() => {
    if (user) {
      loadPuzzles();
    }
  }, [user, loadPuzzles]);

  const solvedPuzzleIds = new Set(
    attempts.filter((a) => a.solved).map((a) => a.puzzleId?._id)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navigation Bar */}
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
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                <PuzzleIcon className="w-4 h-4" />
              </div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">
                Tactical Puzzle Arena
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/learn"
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
            >
              Curriculum Lessons
            </Link>
            <Link
              href="/play"
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors"
            >
              Play Engine
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-emerald-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider">
              <Brain className="w-3.5 h-3.5 text-amber-300" />
              <span>Pattern Recognition &amp; Tactics</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Sharpen Your Strategic Eye
            </h2>
            <p className="text-sm sm:text-base text-emerald-100 leading-relaxed font-medium">
              Solve master tactics to spot forks, skewers, and checkmates before your opponent does.
              Every puzzle solved builds permanent chess instinct.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <Zap className="w-4 h-4 text-amber-300" />
              <span>+25 XP First-Solve Bonus</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{solvedPuzzleIds.size} Solved in Arena</span>
            </div>
          </div>
        </div>

        {/* Theme Filters */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-400">
              <Filter className="w-4 h-4" />
              <span>Filter Tactical Motifs</span>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Showing {puzzles.length} Tactical Challenges
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {THEMES.map((theme) => {
              const active = selectedTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
                    active
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-105'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {theme.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 bg-slate-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="p-8 bg-white rounded-3xl border border-rose-200 text-center space-y-4">
            <p className="text-sm font-bold text-rose-600">{error}</p>
            <button
              onClick={loadPuzzles}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Puzzle Cards Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {puzzles.map((puzzle) => {
              const isSolved = solvedPuzzleIds.has(puzzle._id);
              return (
                <div
                  key={puzzle._id}
                  className={`bg-white rounded-3xl border transition-all hover:shadow-lg flex flex-col justify-between p-6 relative overflow-hidden group ${
                    isSolved
                      ? 'border-emerald-200 bg-emerald-50/20 shadow-xs'
                      : 'border-slate-200 hover:border-emerald-300 shadow-sm'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header tags */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                        {puzzle.theme.replace('_', ' ')}
                      </span>

                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          Rating: {puzzle.difficulty}
                        </span>
                        {isSolved && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Solved</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {puzzle.title}
                      </h3>
                      {puzzle.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 font-medium">
                          {puzzle.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer / CTA */}
                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-4">
                    <span className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                      +{puzzle.xpReward} XP
                    </span>

                    <Link
                      href={`/puzzles/${puzzle._id}`}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        isSolved
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 hover:scale-105 active:scale-95'
                      }`}
                    >
                      <span>{isSolved ? 'Practice Again' : 'Solve Puzzle'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && puzzles.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <PuzzleIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">No Puzzles Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no puzzles currently matching the selected filter. Try choosing &quot;All Tactics&quot;.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
