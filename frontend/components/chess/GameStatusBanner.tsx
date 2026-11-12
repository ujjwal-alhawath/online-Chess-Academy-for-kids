import React from 'react';
import { AlertCircle, Bot, Trophy, CheckCircle2, User } from 'lucide-react';
import { PieceColor, BoardOrientation } from '@/types/chess.types';

interface GameStatusBannerProps {
  turn: PieceColor;
  playerColor: BoardOrientation;
  isAiGame: boolean;
  isAiTurn: boolean;
  isThinking: boolean;
  inCheck: boolean;
  isTerminal: boolean;
  resultMessage?: string;
  className?: string;
}

export const GameStatusBanner: React.FC<GameStatusBannerProps> = ({
  turn,
  playerColor,
  isAiGame,
  isAiTurn,
  isThinking,
  inCheck,
  isTerminal,
  resultMessage,
  className = '',
}) => {
  const isMyTurn = (playerColor === 'white' && turn === 'w') || (playerColor === 'black' && turn === 'b');

  if (isTerminal) {
    return (
      <div
        className={`bg-slate-900 text-white rounded-2xl p-4 shadow-md flex items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-sm text-white">Game Concluded</h4>
            <p className="text-xs text-slate-300 font-medium">
              {resultMessage || 'Check the results modal for match summary'}
            </p>
          </div>
        </div>
        <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30">
          Match Finished
        </span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl p-3.5 sm:p-4 shadow-sm border transition-all flex items-center justify-between gap-3 ${
        inCheck
          ? 'bg-rose-50 border-rose-200 text-rose-950'
          : isThinking
          ? 'bg-indigo-50 border-indigo-200 text-indigo-950'
          : isMyTurn
          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
          : 'bg-slate-50 border-slate-200 text-slate-800'
      } ${className}`}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
            inCheck
              ? 'bg-rose-500 text-white border-rose-600 animate-bounce'
              : isThinking
              ? 'bg-indigo-600 text-white border-indigo-700 animate-pulse'
              : isMyTurn
              ? 'bg-emerald-500 text-white border-emerald-600'
              : 'bg-slate-200 text-slate-700 border-slate-300'
          }`}
        >
          {inCheck ? (
            <AlertCircle className="w-5 h-5" />
          ) : isThinking ? (
            <Bot className="w-5 h-5" />
          ) : (
            <User className="w-5 h-5" />
          )}
        </div>

        <div>
          <h4 className="font-black text-sm">
            {inCheck
              ? '⚠️ Check! Defend your King!'
              : isThinking
              ? '🤖 Thinking... Finding best move'
              : isMyTurn
              ? '✨ Your Turn! Plan your move'
              : isAiGame
              ? 'Opponent (AI) Turn'
              : `Opponent (${turn === 'w' ? 'White' : 'Black'}) Turn`}
          </h4>
          <p className="text-xs text-slate-600 font-medium">
            {inCheck
              ? 'Your King is under attack. Move the king, block the check, or capture the attacker.'
              : isThinking
              ? 'Analyzing tactical opportunities...'
              : isMyTurn
              ? 'Click your piece to reveal its legal moves.'
              : 'Waiting for opponent to complete their move.'}
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <span
          className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
            isMyTurn
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          {turn === 'w' ? 'White Move' : 'Black Move'}
        </span>
      </div>
    </div>
  );
};

