import React from 'react';
import { Lightbulb, AlertCircle, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';

interface PuzzleSidePanelProps {
  title: string;
  theme: string;
  difficulty: number;
  xpReward: number;
  mistakes: number;
  hintsUsed: number;
  activeHint: string | null;
  feedback: { message: string; isCorrect: boolean } | null;
  onUseHint: () => void;
  onRetry: () => void;
  isCompleted: boolean;
  isHintLoading: boolean;
}

export const PuzzleSidePanel: React.FC<PuzzleSidePanelProps> = ({
  title,
  theme,
  difficulty,
  xpReward,
  mistakes,
  hintsUsed,
  activeHint,
  feedback,
  onUseHint,
  onRetry,
  isCompleted,
  isHintLoading,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
            {theme}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
            Rating: {difficulty}
          </span>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-brand-50 text-brand-700">
            +{xpReward} XP
          </span>
        </div>
        <h3 className="text-xl font-black text-slate-900">{title}</h3>
      </div>

      {/* Mission prompt */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Your Mission</p>
        <p className="text-xs font-bold text-slate-800 leading-relaxed">
          Find the best tactical sequence to gain an advantage or deliver checkmate.
        </p>
      </div>

      {/* Dynamic Feedback Box */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-start space-x-3 transition-all ${
            feedback.isCorrect
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}
        >
          {feedback.isCorrect ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs leading-relaxed">
            <p className="font-extrabold">{feedback.message}</p>
          </div>
        </div>
      )}

      {/* Hint Section */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Need inspiration?</span>
          {hintsUsed > 0 && (
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
              Hint #{hintsUsed}
            </span>
          )}
        </div>

        {activeHint ? (
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 leading-relaxed font-medium">
            💡 {activeHint}
          </div>
        ) : null}

        {!isCompleted && (
          <button
            type="button"
            disabled={isHintLoading}
            onClick={onUseHint}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-black transition-colors disabled:opacity-50"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>{isHintLoading ? 'Consulting Coach...' : 'Request a Hint'}</span>
          </button>
        )}
      </div>

      {/* Tries and Mistakes */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>
          Mistakes: <strong className="text-slate-800">{mistakes}</strong>
        </span>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1 font-bold text-slate-600 hover:text-slate-900"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Position</span>
        </button>
      </div>
    </div>
  );
};
