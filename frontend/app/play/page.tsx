'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Crown,
  Bot,
  Users,
  Sparkles,
  Zap,
  ArrowRight,
  History,
  Shield,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { GameService } from '@/services/game.service';
import { AiDifficulty } from '@/types/chess.types';

export default function PlaySetupPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [gameMode, setGameMode] = useState<'AI' | 'PRACTICE'>('AI');
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>('EASY' as unknown as AiDifficulty);
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | 'random'>('white');
  const [isStarting, setIsStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Authentication Guard
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  const handleStartGame = async () => {
    if (isStarting) return;
    setIsStarting(true);
    setErrorMsg(null);

    try {
      const res = await GameService.createGame({
        gameMode,
        aiLevel: gameMode === 'AI' ? (aiDifficulty as unknown as AiDifficulty) : undefined,
        playerColor,
      });

      if (res.success && res.game) {
        router.push(`/play/${res.game._id}`);
      } else {
        setErrorMsg('Could not initialize game on academy server.');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create game');
    } finally {
      setIsStarting(false);
    }
  };

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Crown className="w-5 h-5 fill-current text-amber-300" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-lg leading-tight block">
                Kids Chess <span className="text-brand-600">Academy</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 block -mt-0.5">
                Play & Practice Arena
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/games"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>Match History</span>
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
        {/* Title banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Tactical Practice Arena</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Start a New Chess Match
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto font-medium">
            Test your strategic thinking against the academy AI robot or practice custom moves.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* Setup Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-7">
          {/* 1. Opponent Selection */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500">
              1. Choose Opponent Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGameMode('AI')}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start space-x-3.5 ${
                  gameMode === 'AI'
                    ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-brand-100 text-brand-700 shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Play vs Academy Robot</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Earn up to +75 XP and improve your tactical calculation.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('PRACTICE')}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start space-x-3.5 ${
                  gameMode === 'PRACTICE'
                    ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-700 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Pass & Play / Sandbox</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Practice opening theories and experiment freely.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. AI Difficulty (if AI mode) */}
          {gameMode === 'AI' && (
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                2. Choose Robot Difficulty
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'BEGINNER' as AiDifficulty,
                    title: 'Beginner',
                    emoji: '🌱',
                    desc: 'Friendly moves, forgiving plays',
                  },
                  {
                    id: 'MEDIUM' as AiDifficulty,
                    title: 'Thinking Player',
                    emoji: '🧠',
                    desc: 'Solid fundamentals & tactics',
                  },
                  {
                    id: 'HARD' as AiDifficulty,
                    title: 'Chess Master',
                    emoji: '👑',
                    desc: 'Sharp tactical master calculation',
                  },
                ].map((diff) => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setAiDifficulty(diff.id)}
                    className={`p-3.5 rounded-2xl border-2 text-center transition-all space-y-1.5 ${
                      aiDifficulty === diff.id
                        ? 'border-amber-400 bg-amber-50/80 ring-2 ring-amber-400/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-2xl block">{diff.emoji}</span>
                    <h5 className="font-black text-slate-900 text-xs sm:text-sm">{diff.title}</h5>
                    <p className="text-[11px] text-slate-500 font-medium">{diff.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Choose Color */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500">
              3. Choose Your Army Color
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'white' as const, label: 'White Army', symbol: '♔', desc: 'Moves first' },
                { id: 'black' as const, label: 'Black Army', symbol: '♚', desc: 'Counter-strikes' },
                { id: 'random' as const, label: 'Surprise Me', symbol: '🎲', desc: 'Random choice' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setPlayerColor(c.id)}
                  className={`p-3.5 rounded-2xl border-2 text-center transition-all space-y-1 ${
                    playerColor === c.id
                      ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl font-black block">{c.symbol}</span>
                  <p className="font-black text-slate-900 text-xs">{c.label}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{c.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Launch Button */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isStarting}
              onClick={handleStartGame}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-slate-950 font-black text-sm py-4 px-6 rounded-2xl shadow-lg shadow-amber-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <span>{isStarting ? 'Preparing Chessboard...' : 'Enter Arena & Start Game'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

