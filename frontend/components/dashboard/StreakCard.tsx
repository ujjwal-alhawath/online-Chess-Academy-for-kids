import React from 'react';
import { Flame, Calendar, Award } from 'lucide-react';
import { StudentStreak } from '@/types/student.types';

interface StreakCardProps {
  streak: StudentStreak;
  className?: string;
}

export const StreakCard: React.FC<StreakCardProps> = ({ streak, className = '' }) => {
  const { current, longest, lastActiveDate } = streak;

  // Determine if active today (UTC comparison)
  const todayStr = new Date().toISOString().split('T')[0];
  const lastActiveStr = lastActiveDate
    ? new Date(lastActiveDate).toISOString().split('T')[0]
    : null;
  const isActiveToday = lastActiveStr === todayStr;

  return (
    <div
      className={`bg-white rounded-3xl border border-amber-200/80 p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between ${className}`}
    >
      {/* Decorative background warmth */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Flame className="w-6 h-6 fill-amber-500 text-amber-600 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Daily Practice Streak</h3>
              <p className="text-xs text-slate-500 font-medium">Build consistent thinking habits</p>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              isActiveToday
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {isActiveToday ? '✓ Practiced Today' : '⚡ Complete a quest today!'}
          </span>
        </div>

        {/* Big Counter */}
        <div className="flex items-baseline space-x-3 py-2">
          <span className="text-5xl font-black text-amber-500 tracking-tight">{current}</span>
          <div>
            <span className="text-lg font-extrabold text-slate-800">
              {current === 1 ? 'Day Streak' : 'Days Streak'}
            </span>
            <p className="text-xs text-slate-500 font-medium">
              {current > 0
                ? 'Great momentum! Keep your fire burning.'
                : 'Solve 1 puzzle or lesson to start your streak!'}
            </p>
          </div>
        </div>

        {/* Stats footer */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <Award className="w-4 h-4 text-amber-500" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Record Streak</p>
              <p className="font-extrabold text-slate-800">{longest} Days</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-600">
            <Calendar className="w-4 h-4 text-brand-500" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Last Practice</p>
              <p className="font-extrabold text-slate-800">
                {lastActiveStr ? lastActiveStr : 'Not started yet'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

