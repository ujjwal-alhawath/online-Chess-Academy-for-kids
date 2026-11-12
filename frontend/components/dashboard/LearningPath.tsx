import React from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Lock, Sparkles, ChevronRight, Award } from 'lucide-react';
import { LearningProgressItem } from '@/types/student.types';
import { EmptyState } from './EmptyState';

interface LearningPathProps {
  learningProgress: LearningProgressItem[];
  className?: string;
}

export const LearningPath: React.FC<LearningPathProps> = ({
  learningProgress,
  className = '',
}) => {
  if (!learningProgress || learningProgress.length === 0) {
    return (
      <div id="learning-path" className={`bg-white rounded-3xl border border-slate-200 p-6 ${className}`}>
        <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-600" />
          <span>Academy Learning Path</span>
        </h3>
        <EmptyState
          icon={BookOpen}
          title="Curriculum Loading"
          description="Your personalized chess curriculum will appear here as lessons are scheduled."
        />
      </div>
    );
  }

  const completedCount = learningProgress.filter((l) => l.isCompleted).length;
  const progressPercent = Math.round((completedCount / learningProgress.length) * 100);

  return (
    <div
      id="learning-path"
      className={`bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2.5 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-black text-slate-900 text-lg">Structured Learning Roadmap</h3>
                <Link
                  href="/learn"
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Step-by-step master lessons designed for young minds
              </p>
            </div>
          </div>
        </div>

        {/* Progress counter */}
        <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-2xl self-start sm:self-auto">
          <Award className="w-5 h-5 text-amber-500" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-slate-900">
                {completedCount} of {learningProgress.length}
              </span>
              <span className="text-[11px] font-bold text-brand-600">({progressPercent}%)</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Lessons Completed
            </p>
          </div>
        </div>
      </div>

      {/* Progress timeline bar */}
      <div className="my-6">
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(3, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Lesson List */}
      <div className="space-y-3">
        {learningProgress.map((lesson, idx) => {
          const isNextUp = !lesson.isCompleted && (idx === 0 || learningProgress[idx - 1].isCompleted);

          return (
            <div
              key={lesson.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                lesson.isCompleted
                  ? 'bg-emerald-50/40 border-emerald-200/70'
                  : isNextUp
                  ? 'bg-white border-brand-300 ring-2 ring-brand-500/20 shadow-md'
                  : 'bg-slate-50/60 border-slate-200/60 opacity-80'
              }`}
            >
              {/* Left: Step number + Title + tags */}
              <div className="flex items-start sm:items-center space-x-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    lesson.isCompleted
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                      : isNextUp
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30 ring-2 ring-brand-300'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {lesson.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      {lesson.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                      {lesson.difficulty}
                    </span>
                    {isNextUp && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        Next Lesson
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                    {lesson.title}
                  </h4>
                </div>
              </div>

              {/* Right: XP badge + Action */}
              <div className="flex items-center justify-between sm:justify-end space-x-3 self-stretch sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-lg">
                  +{lesson.xpReward} XP
                </span>

                {lesson.isCompleted ? (
                  <Link
                    href={`/learn/${lesson.id}`}
                    className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200 px-3 py-1.5 rounded-xl gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Review</span>
                  </Link>
                ) : isNextUp ? (
                  <Link
                    href={`/learn/${lesson.id}`}
                    className="inline-flex items-center text-xs font-black text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-xl gap-1.5 shadow-sm shadow-brand-600/30 transition-all hover:scale-[1.02]"
                  >
                    <span>Start Lesson</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Locked</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

