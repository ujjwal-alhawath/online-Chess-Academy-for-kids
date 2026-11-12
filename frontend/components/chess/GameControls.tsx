import React, { useState } from 'react';
import { RotateCcw, Flag, PlusCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface GameControlsProps {
  onFlipBoard: () => void;
  onResign: () => void;
  isTerminal: boolean;
  disabled?: boolean;
  className?: string;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onFlipBoard,
  onResign,
  isTerminal,
  disabled = false,
  className = '',
}) => {
  const [showResignConfirm, setShowResignConfirm] = useState(false);

  return (
    <>
      <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
        <button
          type="button"
          onClick={onFlipBoard}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold border border-slate-200 shadow-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Flip Board</span>
        </button>

        <div className="flex items-center gap-2">
          {!isTerminal && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => setShowResignConfirm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-rose-50 text-rose-600 text-xs font-extrabold border border-rose-200 shadow-xs transition-colors disabled:opacity-50"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Resign Match</span>
            </button>
          )}

          <Link
            href="/play"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-sm transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>New Game</span>
          </Link>
        </div>
      </div>

      {/* Gentle Resignation Confirmation Modal */}
      {showResignConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">End this match?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                It’s okay to pause or try again! You’ll still receive <strong className="text-slate-900">+25 XP</strong> for completing this practice match.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResignConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Keep Playing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResignConfirm(false);
                  onResign();
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md transition-colors"
              >
                End Match
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

