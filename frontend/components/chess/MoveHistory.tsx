import React, { useEffect, useRef } from 'react';
import { History } from 'lucide-react';
import { MoveHistoryItem } from '@/types/chess.types';

interface MoveHistoryProps {
  moves: MoveHistoryItem[];
  className?: string;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ moves, className = '' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group moves into pairs [White, Black]
  const movePairs: { moveNumber: number; white?: MoveHistoryItem; black?: MoveHistoryItem }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  // Auto-scroll to latest move
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves]);

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
            <History className="w-4 h-4" />
          </div>
          <h4 className="font-black text-slate-900 text-sm">Move History</h4>
        </div>
        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
          {moves.length} ply
        </span>
      </div>

      {/* Scrollable Notation List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto max-h-[300px] sm:max-h-[360px] py-2 space-y-1">
        {movePairs.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400 font-medium">
            Game started! Make your opening move.
          </div>
        ) : (
          movePairs.map((pair, idx) => {
            const isLatest = idx === movePairs.length - 1;

            return (
              <div
                key={pair.moveNumber}
                className="grid grid-cols-12 text-xs py-1.5 px-2 rounded-lg hover:bg-slate-50 font-mono items-center"
              >
                <span className="col-span-3 text-slate-400 font-bold">{pair.moveNumber}.</span>
                <span
                  className={`col-span-4 font-bold ${
                    isLatest && !pair.black ? 'text-brand-600 bg-brand-50 px-2 py-0.5 rounded' : 'text-slate-800'
                  }`}
                >
                  {pair.white?.san || ''}
                </span>
                <span
                  className={`col-span-5 font-bold ${
                    isLatest && pair.black ? 'text-brand-600 bg-brand-50 px-2 py-0.5 rounded' : 'text-slate-800'
                  }`}
                >
                  {pair.black?.san || ''}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

