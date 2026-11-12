'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Puzzle as PuzzleIcon,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Trophy,
} from 'lucide-react';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { PuzzleSidePanel, PuzzleCompletionModal } from '@/components/puzzle';
import { PuzzleService } from '@/services/puzzle.service';
import { PuzzleStartResponse, PuzzleMoveResponse } from '@/types/puzzle.types';
import { useAuth } from '@/hooks/useAuth';
import { BoardOrientation, PieceColor } from '@/types/chess.types';

export default function PuzzleSolverPage() {
  const params = useParams();
  const router = useRouter();
  const puzzleId = params?.puzzleId as string;
  const { user, isLoading: isAuthLoading } = useAuth();

  // Attempt & Puzzle State
  const [attemptData, setAttemptData] = useState<PuzzleStartResponse | null>(null);
  const [currentFen, setCurrentFen] = useState<string>('');
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | undefined>(undefined);
  const [mistakes, setMistakes] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [activeHint, setActiveHint] = useState<string | null>(null);

  // Status & Feedback
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number>(100);
  const [xpAwarded, setXpAwarded] = useState<number>(0);

  // Loading States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isHintLoading, setIsHintLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  // Determine Player Color / Orientation from initial FEN
  const orientation: BoardOrientation = useMemo(() => {
    if (!attemptData?.puzzle?.fen) return 'white';
    const side = attemptData.puzzle.fen.split(' ')[1];
    return side === 'b' ? 'black' : 'white';
  }, [attemptData]);

  const playerColor: PieceColor = useMemo(() => {
    return orientation === 'black' ? 'b' : 'w';
  }, [orientation]);

  // Initialize or Restart Attempt
  const initAttempt = useCallback(async () => {
    if (!puzzleId) return;

    setIsLoading(true);
    setLoadError(null);
    setFeedback(null);
    setIsGameOver(false);
    setMistakes(0);
    setHintsUsed(0);
    setActiveHint(null);
    setLastMove(undefined);

    try {
      const res = await PuzzleService.startAttempt(puzzleId);
      if (res.success) {
        setAttemptData(res);
        setCurrentFen(res.currentFen);
      } else {
        setLoadError('Failed to initialize puzzle session.');
      }
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : 'Error starting puzzle.');
    } finally {
      setIsLoading(false);
    }
  }, [puzzleId]);

  useEffect(() => {
    if (user && puzzleId) {
      initAttempt();
    }
  }, [user, puzzleId, initAttempt]);

  // Handle Player Move Submission
  const handlePlayerMove = async (move: {
    from: string;
    to: string;
    promotion?: 'q' | 'r' | 'b' | 'n';
  }) => {
    if (!attemptData || isGameOver || isEvaluating) return;

    setIsEvaluating(true);
    setLastMove({ from: move.from, to: move.to });

    try {
      const res: PuzzleMoveResponse = await PuzzleService.submitMove(
        attemptData.attemptId,
        move
      );

      if (res.correct) {
        // Move was correct!
        setCurrentFen(res.fen);
        setFeedback({
          message: res.feedback || 'Well played! Brilliant tactical move.',
          isCorrect: true,
        });

        if (res.opponentMove) {
          // If server executed scripted reply, highlight it
          setTimeout(() => {
            setLastMove({
              from: res.opponentMove!.from,
              to: res.opponentMove!.to,
            });
          }, 250);
        }

        if (res.gameOver) {
          setIsGameOver(true);
          setFinalScore(res.score ?? 100);
          setXpAwarded(res.xpAwarded ?? 0);
        }
      } else {
        // Incorrect move
        setMistakes(res.mistakes);
        setFeedback({
          message: res.feedback || 'Not the best move. Think carefully and try again!',
          isCorrect: false,
        });

        // Revert FEN after brief pause so the student can make another try from the correct position
        setTimeout(() => {
          setCurrentFen(res.fen);
        }, 500);
      }
    } catch (err: unknown) {
      setFeedback({
        message: err instanceof Error ? err.message : 'Error validating move.',
        isCorrect: false,
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Request Progressive Hint
  const handleUseHint = async () => {
    if (!attemptData || isGameOver || isHintLoading) return;

    setIsHintLoading(true);
    try {
      const res = await PuzzleService.requestHint(attemptData.attemptId);
      if (res.success) {
        setActiveHint(res.hint);
        setHintsUsed(res.hintsUsed);
      }
    } catch (err: unknown) {
      console.error('Failed to get hint:', err);
    } finally {
      setIsHintLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
            <PuzzleIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-600">Setting up tactical board...</p>
        </div>
      </div>
    );
  }

  if (loadError || !attemptData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-rose-200 p-8 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-black text-slate-900 text-lg">Unable to Load Puzzle</h3>
          <p className="text-xs text-slate-600">{loadError || 'Puzzle not found.'}</p>
          <div className="flex gap-2 justify-center pt-2">
            <Link
              href="/puzzles"
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
            >
              Back to Catalog
            </Link>
            <button
              onClick={initAttempt}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { puzzle } = attemptData;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/puzzles"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Back to Puzzles"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-black text-slate-900">{puzzle.title}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                  {puzzle.theme}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {playerColor === 'w' ? 'White to move' : 'Black to move'} • Rating {puzzle.difficulty}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={initAttempt}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Position</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Solver Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Center: Interactive Chess Board */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center">
            <div className="w-full max-w-[560px] space-y-4">
              {/* Turn Indicator Banner */}
              <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border ${
                      playerColor === 'w' ? 'bg-white border-slate-400' : 'bg-slate-900 border-black'
                    }`}
                  />
                  <span className="text-xs font-extrabold text-slate-800">
                    {playerColor === 'w' ? 'White to Move & Win' : 'Black to Move & Win'}
                  </span>
                </div>

                {isEvaluating && (
                  <span className="text-[11px] font-bold text-emerald-600 animate-pulse">
                    Evaluating tactical move...
                  </span>
                )}
              </div>

              {/* Authoritative Interactive Board */}
              <div className="relative">
                <ChessBoard
                  fen={currentFen}
                  orientation={orientation}
                  playerColor={playerColor}
                  disabled={isGameOver || isEvaluating}
                  lastMove={lastMove}
                  onMove={handlePlayerMove}
                />
              </div>
            </div>
          </div>

          {/* Right: Side Panel with Hints & Stats */}
          <div className="lg:col-span-5 xl:col-span-4">
            <PuzzleSidePanel
              title={puzzle.title}
              theme={puzzle.theme}
              difficulty={puzzle.difficulty}
              xpReward={puzzle.xpReward}
              mistakes={mistakes}
              hintsUsed={hintsUsed}
              activeHint={activeHint}
              feedback={feedback}
              onUseHint={handleUseHint}
              onRetry={initAttempt}
              isCompleted={isGameOver}
              isHintLoading={isHintLoading}
            />
          </div>
        </div>
      </main>

      {/* Completion Modal */}
      <PuzzleCompletionModal
        isOpen={isGameOver}
        score={finalScore}
        mistakes={mistakes}
        hintsUsed={hintsUsed}
        xpAwarded={xpAwarded}
        onRetry={initAttempt}
      />
    </div>
  );
}
