import React from 'react';
import { ChessPiece } from './ChessPiece';
import { PieceColor } from '@/types/chess.types';
import { Sparkles } from 'lucide-react';

interface PromotionModalProps {
  color: PieceColor;
  isOpen: boolean;
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
}

const PROMOTION_PIECES = [
  { type: 'q' as const, label: 'Queen', desc: 'Powerful & fast', color: 'border-amber-400 bg-amber-50' },
  { type: 'r' as const, label: 'Rook', desc: 'Mighty fortress', color: 'border-brand-400 bg-brand-50' },
  { type: 'b' as const, label: 'Bishop', desc: 'Diagonal wizard', color: 'border-purple-400 bg-purple-50' },
  { type: 'n' as const, label: 'Knight', desc: 'Tricky jumper', color: 'border-emerald-400 bg-emerald-50' },
];

export const PromotionModal: React.FC<PromotionModalProps> = ({ color, isOpen, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border-2 border-amber-300 text-center space-y-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Pawn Promotion!</span>
          </div>
          <h3 className="text-xl font-black text-slate-900">Choose Your Hero Piece</h3>
          <p className="text-xs text-slate-500 font-medium">
            Your brave pawn marched across the entire battlefield. What shall it become?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {PROMOTION_PIECES.map((p) => (
            <button
              key={p.type}
              onClick={() => onSelect(p.type)}
              className={`p-3.5 rounded-2xl border-2 ${p.color} hover:scale-105 active:scale-95 transition-all flex flex-col items-center space-y-2 shadow-xs group`}
            >
              <div className="w-14 h-14 p-1 group-hover:scale-110 transition-transform">
                <ChessPiece type={p.type} color={color} />
              </div>
              <div>
                <p className="font-black text-slate-900 text-sm">{p.label}</p>
                <p className="text-[11px] text-slate-500 font-medium">{p.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

