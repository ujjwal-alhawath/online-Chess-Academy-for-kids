'use client';

import React, { useState, useMemo } from 'react';
import { Chess } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import { PromotionModal } from './PromotionModal';
import { BoardOrientation, PieceColor, PieceType } from '@/types/chess.types';

interface MoveAttempt {
  from: string;
  to: string;
  promotion?: 'q' | 'r' | 'b' | 'n';
}

interface ChessBoardProps {
  fen: string;
  orientation?: BoardOrientation;
  playerColor?: PieceColor;
  disabled?: boolean;
  lastMove?: { from: string; to: string };
  onMove: (move: MoveAttempt) => void;
  className?: string;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  orientation = 'white',
  playerColor,
  disabled = false,
  lastMove,
  onMove,
  className = '',
}) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);

  // Authoritative chess.js instance for current position
  const chess = useMemo(() => new Chess(fen), [fen]);
  const turn = chess.turn(); // 'w' | 'b'

  // Determine King in check square (if any)
  const checkSquare = useMemo(() => {
    if (!chess.isCheck()) return null;
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          return `${FILES[c]}${8 - r}`;
        }
      }
    }
    return null;
  }, [chess, turn]);

  // Compute legal destination squares for the selected square
  const legalDestinations = useMemo(() => {
    if (!selectedSquare) return new Set<string>();
    const moves = chess.moves({ square: selectedSquare as unknown as never, verbose: true });
    return new Set(moves.map((m) => m.to));
  }, [chess, selectedSquare]);

  // Order ranks and files based on orientation
  const displayedFiles = orientation === 'white' ? FILES : [...FILES].reverse();
  const displayedRanks = orientation === 'white' ? RANKS : [...RANKS].reverse();

  const handleSquareClick = (square: string) => {
    if (disabled) return;

    // Turn check: If playerColor specified, player can only interact on their turn
    if (playerColor && turn !== playerColor) return;

    const pieceOnSquare = chess.get(square as unknown as never);

    // 1. If clicking a legal destination for previously selected piece -> execute move
    if (selectedSquare && legalDestinations.has(square)) {
      const movingPiece = chess.get(selectedSquare as unknown as never);

      // Check for pawn promotion (pawn moving to 8th rank for white or 1st rank for black)
      const isPawnPromotion =
        movingPiece?.type === 'p' &&
        ((movingPiece.color === 'w' && square.endsWith('8')) ||
          (movingPiece.color === 'b' && square.endsWith('1')));

      if (isPawnPromotion) {
        setPendingPromotion({ from: selectedSquare, to: square });
      } else {
        onMove({ from: selectedSquare, to: square });
        setSelectedSquare(null);
      }
      return;
    }

    // 2. If clicking own piece -> select it
    if (pieceOnSquare && pieceOnSquare.color === turn) {
      if (playerColor && pieceOnSquare.color !== playerColor) return;
      setSelectedSquare(square === selectedSquare ? null : square);
      return;
    }

    // 3. Otherwise deselect
    setSelectedSquare(null);
  };

  const handlePromotionSelect = (piece: 'q' | 'r' | 'b' | 'n') => {
    if (pendingPromotion) {
      onMove({ from: pendingPromotion.from, to: pendingPromotion.to, promotion: piece });
      setPendingPromotion(null);
      setSelectedSquare(null);
    }
  };

  return (
    <div className={`relative max-w-[560px] w-full mx-auto select-none ${className}`}>
      {/* Board Aspect Ratio Wrapper */}
      <div className="aspect-square w-full bg-slate-800 rounded-3xl p-3 sm:p-4 shadow-2xl border-4 border-slate-700/60 relative overflow-hidden">
        {/* 8x8 Grid */}
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-2xl overflow-hidden shadow-inner border border-slate-900/40">
          {displayedRanks.map((rank, rankIdx) =>
            displayedFiles.map((file, fileIdx) => {
              const square = `${file}${rank}`;
              const isLight = (rankIdx + fileIdx) % 2 === 0;
              const piece = chess.get(square as unknown as never);
              const isSelected = square === selectedSquare;
              const isLegal = legalDestinations.has(square);
              const isLastMoveFrom = lastMove?.from === square;
              const isLastMoveTo = lastMove?.to === square;
              const isKingInCheck = square === checkSquare;

              // Square Colors
              const squareBg = isLight ? 'bg-amber-50/95' : 'bg-amber-800/80';

              return (
                <div
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${squareBg} ${
                    isSelected ? 'ring-4 ring-amber-400 ring-inset bg-amber-200/90' : ''
                  } ${
                    isLastMoveFrom || isLastMoveTo ? 'bg-sky-200/70' : ''
                  } ${
                    isKingInCheck ? 'bg-rose-500/80 animate-pulse ring-4 ring-rose-400 ring-inset' : ''
                  }`}
                >
                  {/* File & Rank Coordinate Labels */}
                  {fileIdx === 0 && (
                    <span
                      className={`absolute top-0.5 left-1 text-[9px] sm:text-[11px] font-black ${
                        isLight ? 'text-amber-900/60' : 'text-amber-100/70'
                      }`}
                    >
                      {rank}
                    </span>
                  )}
                  {rankIdx === 7 && (
                    <span
                      className={`absolute bottom-0.5 right-1 text-[9px] sm:text-[11px] font-black ${
                        isLight ? 'text-amber-900/60' : 'text-amber-100/70'
                      }`}
                    >
                      {file}
                    </span>
                  )}

                  {/* Render Chess Piece */}
                  {piece && (
                    <div className="w-[82%] h-[82%] z-10 hover:scale-105 transition-transform duration-100 drop-shadow-sm">
                      <ChessPiece type={piece.type as PieceType} color={piece.color as PieceColor} />
                    </div>
                  )}

                  {/* Legal Destination Highlight */}
                  {isLegal && !piece && (
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900/30 z-20 pointer-events-none" />
                  )}
                  {isLegal && piece && (
                    <div className="absolute inset-1 rounded-full border-4 border-rose-500/80 z-20 pointer-events-none animate-pulse" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pawn Promotion Modal */}
      <PromotionModal
        isOpen={pendingPromotion !== null}
        color={turn as PieceColor}
        onSelect={handlePromotionSelect}
      />
    </div>
  );
};

