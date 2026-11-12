'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Crown,
  History,
  LayoutDashboard,
  PlusCircle,
  Trophy,
  Swords,
  Bot,
  Calendar,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { GameService } from '@/services/game.service';
import { GameDTO } from '@/types/chess.types';

export default function GameHistoryPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [games, setGames] = useState<GameDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setErrorMsg(null);
        const res = await GameService.getHistory(page, 10);
        if (res.success) {
          setGames(res.games);
          setTotal(res.total);
          setTotalPages(res.totalPages);
        } else {
          setErrorMsg('Failed to load games list');
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Could not fetch game history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user, page]);

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
                Match Records
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/play"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Match</span>
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                <History className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Your Match History
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Review completed battles, analyze your moves, and track your tactical progress.
            </p>
          </div>

          <span className="text-xs font-black text-slate-500 bg-white border border-slate-200 px-3.5 py-1.5 rounded-2xl shadow-xs self-start sm:self-auto">
            {total} Total Games
          </span>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* Games List */}
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 bg-slate-200 rounded-2xl" />
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto text-2xl">
              ⚔️
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-lg">No Games Played Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Step onto the board! Play your first match against the academy robot to earn experience points.
              </p>
            </div>
            <Link
              href="/play"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs py-3 px-5 rounded-xl shadow-md transition-all hover:scale-105"
            >
              <span>Play First Game</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {games.map((g) => {
              const isWhite = g.whitePlayerId && g.whitePlayerId._id === user.id;
              const won =
                (isWhite && g.result === 'WHITE_WON') || (!isWhite && g.result === 'BLACK_WON');
              const isDraw = g.result === 'DRAW';
              const inProgress = g.result === 'IN_PROGRESS';

              const opponentName = isWhite
                ? g.blackIsAI
                  ? `Robot (${g.aiLevel || 'AI'})`
                  : g.blackPlayerId?.username || 'Opponent'
                : g.whiteIsAI
                ? `Robot (${g.aiLevel || 'AI'})`
                : g.whitePlayerId?.username || 'Opponent';

              return (
                <Link
                  key={g._id}
                  href={`/play/${g._id}`}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 border ${
                        won
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : isDraw
                          ? 'bg-slate-100 text-slate-700 border-slate-300'
                          : inProgress
                          ? 'bg-brand-100 text-brand-700 border-brand-300'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {won ? '🏆' : isDraw ? '🤝' : inProgress ? '⚡' : '♟️'}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-slate-900">vs {opponentName}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] font-bold text-slate-400">
                          Playing as {isWhite ? 'White' : 'Black'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(g.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span>{g.moves.length} ply moves</span>
                        {g.terminationReason && (
                          <>
                            <span>•</span>
                            <span className="uppercase text-[10px] font-black text-slate-400">
                              {g.terminationReason}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <span
                      className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                        won
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isDraw
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : inProgress
                          ? 'bg-brand-50 text-brand-700 border-brand-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {won ? 'Victory' : isDraw ? 'Draw' : inProgress ? 'In Progress' : 'Defeat'}
                    </span>

                    <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-brand-50 text-slate-400 group-hover:text-brand-600 flex items-center justify-center transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-4">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

