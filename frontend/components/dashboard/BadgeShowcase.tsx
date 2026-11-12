import React, { useState } from 'react';
import { Award, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { BadgeDTO } from '@/types/student.types';
import { EmptyState } from './EmptyState';

interface BadgeShowcaseProps {
  badges: BadgeDTO[];
  className?: string;
}

export const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({ badges, className = '' }) => {
  const [filter, setFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');

  if (!badges || badges.length === 0) {
    return (
      <div className={`bg-white rounded-3xl border border-slate-200 p-6 ${className}`}>
        <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Trophy Case & Badges</span>
        </h3>
        <EmptyState
          icon={Award}
          title="Badges Initializing"
          description="Your trophies and mastery achievements will appear here as you practice."
        />
      </div>
    );
  }

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;
  const filteredBadges = badges.filter((b) => {
    if (filter === 'UNLOCKED') return b.isUnlocked;
    if (filter === 'LOCKED') return !b.isUnlocked;
    return true;
  });

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-lg">Trophy Case & Achievements</h3>
            <p className="text-xs text-slate-500 font-medium">
              Earn badges for strategic thinking, streaks, and tournament mastery
            </p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            All ({badges.length})
          </button>
          <button
            onClick={() => setFilter('UNLOCKED')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
              filter === 'UNLOCKED'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>Unlocked</span>
            <span className="text-[10px] bg-black/10 px-1 rounded-full">{unlockedCount}</span>
          </button>
          <button
            onClick={() => setFilter('LOCKED')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'LOCKED'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Locked ({badges.length - unlockedCount})
          </button>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
        {filteredBadges.map((badge) => (
          <div
            key={badge.badgeCode}
            className={`p-4 rounded-2xl border transition-all flex items-start space-x-3.5 relative overflow-hidden ${
              badge.isUnlocked
                ? 'bg-gradient-to-br from-amber-50/60 via-white to-amber-50/20 border-amber-200/80 shadow-xs hover:shadow-md'
                : 'bg-slate-50/60 border-slate-200/60 opacity-60 hover:opacity-80'
            }`}
          >
            {/* Badge Icon */}
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm border ${
                badge.isUnlocked
                  ? 'bg-gradient-to-br from-amber-300 to-amber-400 border-amber-300 text-slate-950 shadow-amber-500/20'
                  : 'bg-slate-200/80 border-slate-300 text-slate-400'
              }`}
            >
              {badge.icon || (badge.isUnlocked ? '🏆' : '🔒')}
            </div>

            {/* Badge Information */}
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {badge.category}
                </span>
                {badge.isUnlocked ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Unlocked</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Locked</span>
                  </span>
                )}
              </div>

              <h4 className="font-extrabold text-sm text-slate-900 truncate">{badge.name}</h4>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {badge.description}
              </p>

              {badge.isUnlocked && badge.unlockedAt && (
                <p className="text-[10px] text-amber-700 font-semibold pt-1">
                  Earned {new Date(badge.unlockedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

