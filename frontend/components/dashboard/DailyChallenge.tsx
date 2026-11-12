import React from 'react';
import { Target, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { DailyChallengeDTO } from '@/types/student.types';
import { EmptyState } from './EmptyState';

interface DailyChallengeProps {
  challenge: DailyChallengeDTO | null;
  className?: string;
}

export const DailyChallenge: React.FC<DailyChallengeProps> = ({ challenge, className = '' }) => {
  if (!challenge) {
    return (
      <div id="daily-challenge" className={`bg-white rounded-3xl border border-slate-200 p-6 ${className}`}>
        <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-brand-600" />
          <span>Today&apos;s Daily Quest</span>
        </h3>
        <EmptyState
          icon={Target}
          title="All Quests Clear for Today!"
          description="You’re caught up! Check back tomorrow morning for new chess challenges and bonus XP rewards."
        />
      </div>
    );
  }

  const categoryColor = {
    TACTICS: 'bg-purple-100 text-purple-700 border-purple-200',
    PUZZLE: 'bg-brand-100 text-brand-700 border-brand-200',
    LESSON: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    REFLECTION: 'bg-amber-100 text-amber-700 border-amber-200',
  }[challenge.type] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div
      id="daily-challenge"
      className={`bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${className}`}
    >
      {/* Decorative gradient corner */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-100/50 to-transparent rounded-bl-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2.5 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Today&apos;s Quest</h3>
              <p className="text-xs text-slate-500 font-medium">Daily practice bonus challenge</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${categoryColor}`}
            >
              {challenge.type}
            </span>
            <div className="flex items-center space-x-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-black shadow-xs">
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>+{challenge.xpReward} XP</span>
            </div>
          </div>
        </div>

        {/* Challenge details */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
          <h4 className="font-black text-slate-800 text-base">{challenge.title}</h4>
          <p className="text-xs text-slate-600 leading-relaxed">{challenge.description}</p>

          <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-2 border-t border-slate-200/60">
            <span>Goal: Complete {challenge.targetCount} objective{challenge.targetCount > 1 ? 's' : ''}</span>
            <span className="text-brand-600">Reward: {challenge.xpReward} Experience Points</span>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={() => {
            const el = document.getElementById('learning-path');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-sm group"
        >
          <span>Begin Daily Quest</span>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

