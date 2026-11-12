import React from 'react';
import { Trophy, Sparkles, Zap, ArrowRight, RotateCcw, Compass } from 'lucide-react';
import Link from 'next/link';

interface PuzzleCompletionModalProps {
  isOpen: boolean;
  score: number;
  mistakes: number;
  hintsUsed: number;
  xpAwarded: number;
  onRetry: () => void;
  nextPuzzleId?: string;
}

export const PuzzleCompletionModal: React.FC<PuzzleCompletionModalProps> = ({
  isOpen,
  score,
  mistakes,
  hintsUsed,
  xpAwarded,
  onRetry,
  nextPuzzleId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-emerald-300 text-center space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-400 to-emerald-300 text-slate-950 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-500/30">
            🧩
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Tactical Mission Solved!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Sharp calculation! You discovered the winning tactical pattern.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2.5 py-2">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Tactical Score</p>
              <p className="text-xl font-black text-slate-900">{score}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Mistakes</p>
              <p className="text-xl font-black text-slate-900">{mistakes}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Hints Used</p>
              <p className="text-xl font-black text-slate-900">{hintsUsed}</p>
            </div>
          </div>

          {/* XP Banner */}
          <div className="bg-gradient-to-r from-amber-50 via-brand-50 to-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-left">
              <div className="p-2 rounded-xl bg-amber-400 text-slate-950">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Tactical Mastery</p>
                <p className="text-xs font-black text-slate-900">
                  {xpAwarded > 0 ? 'First Solve Reward' : 'Mastery Practice Recorded'}
                </p>
              </div>
            </div>
            <span className="text-lg font-black text-amber-600">
              {xpAwarded > 0 ? `+${xpAwarded} XP` : '✓ Practiced'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-1">
          {nextPuzzleId ? (
            <Link
              href={`/puzzles/${nextPuzzleId}`}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs py-3.5 px-4 rounded-xl shadow-md transition-all hover:scale-[1.01]"
            >
              <span>Next Tactical Puzzle</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/puzzles"
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs py-3.5 px-4 rounded-xl shadow-md transition-all"
            >
              <span>Explore More Puzzles</span>
              <Compass className="w-4 h-4" />
            </Link>
          )}

          <button
            type="button"
            onClick={onRetry}
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 px-4 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Practice This Position Again</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center text-slate-500 hover:text-slate-800 font-bold text-xs py-2 transition-colors"
          >
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
