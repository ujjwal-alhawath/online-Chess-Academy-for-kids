import React from 'react';
import { Sparkles, Trophy, Zap } from 'lucide-react';
import { XpProgress } from '@/types/student.types';

interface XPProgressProps {
  xpProgress: XpProgress;
  className?: string;
}

const LEVEL_TITLES: Record<number, string> = {
  1: 'Curious Pawn',
  2: 'Brave Knight',
  3: 'Swift Bishop',
  4: 'Sturdy Rook',
  5: 'Wise Queen',
  6: 'Grandmaster Strategist',
};

export const XPProgress: React.FC<XPProgressProps> = ({ xpProgress, className = '' }) => {
  const currentLevel = xpProgress?.currentLevel ?? 1;
  const totalXp = xpProgress?.totalXp ?? 0;
  const xpInCurrentLevel = xpProgress?.xpInCurrentLevel ?? 0;
  const xpRequiredForNextLevel = xpProgress?.xpRequiredForNextLevel ?? 100;
  const percentage = xpProgress?.percentage ?? 0;
  const xpRemaining = xpProgress?.xpRemaining ?? Math.max(0, xpRequiredForNextLevel - xpInCurrentLevel);
  const levelTitle = LEVEL_TITLES[currentLevel] || `Grand Strategist Tier ${currentLevel}`;

  return (
    <div
      className={`bg-gradient-to-br from-brand-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden ${className}`}
    >
      {/* Decorative background glows */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              {currentLevel}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400">
                  Level {currentLevel}
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-xs font-semibold text-slate-300">{levelTitle}</span>
              </div>
              <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                <span>Experience Points</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end space-x-1.5 text-amber-300 font-black text-xl">
              <Zap className="w-5 h-5 fill-amber-300" />
              <span>{totalXp.toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-300">Total XP</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              +{xpRemaining} XP needed for Level {currentLevel + 1}
            </p>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-300">
              {xpInCurrentLevel} / {xpRequiredForNextLevel} XP
            </span>
            <span className="text-amber-400">{percentage}% towards Level {currentLevel + 1}</span>
          </div>

          <div className="w-full h-4 bg-slate-800/80 rounded-full p-0.5 border border-slate-700/60 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-brand-400 to-brand-500 transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${Math.max(4, Math.min(100, percentage))}%` }}
            />
          </div>
        </div>

        {/* Motivation note */}
        <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-slate-800/60">
          <span className="flex items-center gap-1 text-slate-400 font-medium">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Complete today&apos;s quests to level up faster!
          </span>
          <span className="text-brand-300 font-bold">Level {currentLevel + 1} Unlocks New Badges</span>
        </div>
      </div>
    </div>
  );
};

