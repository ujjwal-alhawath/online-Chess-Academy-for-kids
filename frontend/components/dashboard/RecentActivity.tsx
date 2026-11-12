import React from 'react';
import { History, Zap, CheckCircle, BookOpen, Trophy, Flame } from 'lucide-react';
import { RecentActivityItem } from '@/types/student.types';
import { EmptyState } from './EmptyState';

interface RecentActivityProps {
  activities: RecentActivityItem[];
  className?: string;
}

const getSourceMeta = (type: string) => {
  switch (type) {
    case 'LESSON':
      return {
        icon: BookOpen,
        color: 'text-brand-600 bg-brand-50 border-brand-100',
        label: 'Lesson Completed',
      };
    case 'PUZZLE':
      return {
        icon: CheckCircle,
        color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        label: 'Puzzle Solved',
      };
    case 'DAILY_CHALLENGE':
      return {
        icon: Zap,
        color: 'text-amber-600 bg-amber-50 border-amber-100',
        label: 'Daily Challenge',
      };
    case 'BADGE':
      return {
        icon: Trophy,
        color: 'text-purple-600 bg-purple-50 border-purple-100',
        label: 'Badge Unlocked',
      };
    case 'STREAK':
      return {
        icon: Flame,
        color: 'text-rose-600 bg-rose-50 border-rose-100',
        label: 'Streak Bonus',
      };
    default:
      return {
        icon: Zap,
        color: 'text-slate-600 bg-slate-50 border-slate-100',
        label: 'Activity',
      };
  }
};

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  className = '',
}) => {
  if (!activities || activities.length === 0) {
    return (
      <div className={`bg-white rounded-3xl border border-slate-200 p-6 ${className}`}>
        <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-brand-600" />
          <span>Recent Activity Stream</span>
        </h3>
        <EmptyState
          icon={History}
          title="No Activity Logged Yet"
          description="Solve puzzles, finish lessons, or complete your daily challenge to see your activity timeline grow!"
        />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-2.5 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-lg">Recent Academy Activity</h3>
            <p className="text-xs text-slate-500 font-medium">Real-time log of your learning milestones</p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
          Last {activities.length} entries
        </span>
      </div>

      {/* Activity stream list */}
      <div className="divide-y divide-slate-100 pt-3">
        {activities.map((act) => {
          const meta = getSourceMeta(act.type);
          const Icon = meta.icon;

          return (
            <div key={act.id} className="py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${meta.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {meta.label}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(act.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                    {act.reason}
                  </p>
                </div>
              </div>

              {/* XP Award badge */}
              <div className="shrink-0 flex items-center space-x-1 bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-1 rounded-full text-xs font-black">
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>+{act.amount} XP</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

