import React from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Lock, Sparkles, ChevronRight } from 'lucide-react';
import { LessonSummaryDTO } from '@/types/lesson.types';

interface LessonCardProps {
  lesson: LessonSummaryDTO;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson }) => {
  const { _id, title, description, category, difficulty, order, xpReward, isCompleted, isLocked } = lesson;

  return (
    <div
      className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden ${
        isCompleted
          ? 'bg-emerald-50/50 border-emerald-200/80 shadow-xs'
          : !isLocked
          ? 'bg-white border-brand-300 shadow-md ring-2 ring-brand-500/10'
          : 'bg-slate-50/70 border-slate-200/60 opacity-60'
      }`}
    >
      {/* Left: Step number + Information */}
      <div className="flex items-start sm:items-center space-x-4 min-w-0">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border ${
            isCompleted
              ? 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/20 shadow-md'
              : !isLocked
              ? 'bg-brand-600 text-white border-brand-700 shadow-brand-600/20 shadow-md ring-2 ring-brand-300'
              : 'bg-slate-200 text-slate-400 border-slate-300'
          }`}
        >
          {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : isLocked ? <Lock className="w-5 h-5" /> : <span>{order}</span>}
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              {category.replace('_', ' ')}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500">
              {difficulty}
            </span>
            {!isCompleted && !isLocked && (
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Available Now</span>
              </span>
            )}
          </div>

          <h3 className="font-black text-slate-900 text-base truncate">{title}</h3>
          <p className="text-xs text-slate-500 line-clamp-1 font-medium">{description}</p>
        </div>
      </div>

      {/* Right: XP & Action button */}
      <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <span className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
          +{xpReward} XP
        </span>

        {isCompleted ? (
          <Link
            href={`/learn/${_id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
          >
            <span>Review</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        ) : !isLocked ? (
          <Link
            href={`/learn/${_id}`}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/25 transition-all hover:scale-105 active:scale-95"
          >
            <span>Start Lesson</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-400">
            <Lock className="w-3 h-3" />
            <span>Complete Prior Lesson</span>
          </span>
        )}
      </div>
    </div>
  );
};

