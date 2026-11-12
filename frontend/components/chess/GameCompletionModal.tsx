import React from 'react';
import { Trophy, Sparkles, Zap, ArrowRight, RotateCcw, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

interface GameCompletionModalProps {
  isOpen: boolean;
  result: 'WHITE_WON' | 'BLACK_WON' | 'DRAW' | 'IN_PROGRESS';
  terminationReason: string | null;
  playerColor: 'white' | 'black';
  onClose: () => void;
}

export const GameCompletionModal: React.FC<GameCompletionModalProps> = ({
  isOpen,
  result,
  terminationReason,
  playerColor,
  onClose,
}) => {
  if (!isOpen || result === 'IN_PROGRESS') return null;

  const isWin = (playerColor === 'white' && result === 'WHITE_WON') || (playerColor === 'black' && result === 'BLACK_WON');
  const isDraw = result === 'DRAW';

  let title = 'Game Finished!';
  let subtitle = 'Great effort on the board today.';
  let xpEarned = 25;

  if (isWin) {
    title = 'Victory, Chess Champion! 🏆';
    subtitle = `Brilliant tactical execution! You won by ${terminationReason === 'CHECKMATE' ? 'Checkmate' : 'Resignation'}.`;
    xpEarned = 75; // 25 finish + 50 win
  } else if (isDraw) {
    title = 'Strategic Draw! 🤝';
    subtitle = `A balanced and hard-fought battle ended in a peaceful draw (${terminationReason || 'Draw'}).`;
    xpEarned = 25;
  } else {
    title = 'Great Learning Effort! 🌟';
    subtitle = 'Every game makes your tactical mind sharper. Analyze what you learned and play again!';
    xpEarned = 25;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-amber-300 text-center space-y-6 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-amber-500/30">
            {isWin ? '🏆' : isDraw ? '🤝' : '🌱'}
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* XP Reward Banner */}
          <div className="bg-gradient-to-r from-amber-50 via-brand-50 to-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-left">
              <div className="p-2 rounded-xl bg-amber-400 text-slate-950">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Experience Awarded</p>
                <p className="text-xs font-black text-slate-900">
                  {isWin ? 'Match Finish + Win Bonus' : 'Match Completion XP'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xl font-black text-amber-600">+{xpEarned} XP</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <Link
            href="/play"
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs py-3.5 px-4 rounded-xl shadow-md shadow-brand-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Another Match</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 px-4 rounded-xl transition-colors"
          >
            <span>Review Move History</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-800 font-bold text-xs py-2 transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Return to Student Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

