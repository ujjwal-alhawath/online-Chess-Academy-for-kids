'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Chess } from 'chess.js';
import {
  Crown,
  History,
  LayoutDashboard,
  Bot,
  User,
  Shield,
  AlertCircle,
  RefreshCw,
  Trophy,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { GameService } from '@/services/game.service';
import { useStockfish } from '@/hooks/useStockfish';
import {
  ChessBoard,
  MoveHistory,
  GameStatusBanner,
  GameControls,
  GameCompletionModal,
} from '@/components/chess';
import { GameDTO, BoardOrientation, PieceColor, AiDifficulty } from '@/types/chess.types';

export default function PlayArenaPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  const { user, isLoading: isAuthLoading } = useAuth();
  const { isThinking, engineError, getAiMove } = useStockfish();

  const [game, setGame] = useState<GameDTO | null>(null);
  const [boardOrientation, setBoardOrientation] = useState<BoardOrientation>('white');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmittingMove, setIsSubmittingMove] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Prevent duplicate AI moves with a mutex ref
  const isAiMovingRef = useRef(false);

  // Load authoritative game state
  const loadGame = useCallback(async () => {
    if (!gameId) return;
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await GameService.getGame(gameId);
      if (res.success && res.game) {
        setGame(res.game);

        // Determine player color and orientation
        if (user && res.game.blackPlayerId && res.game.blackPlayerId._id === user.id) {
          setBoardOrientation('black');
        } else {
          setBoardOrientation('white');
        }

        if (res.game.result !== 'IN_PROGRESS') {
          setShowCompletionModal(true);
        }
      } else {
        setErrorMessage('Failed to load match details.');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Could not load game from academy server');
    } finally {
      setIsLoading(false);
    }
  }, [gameId, user]);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (user && gameId) {
      loadGame();
    }
  }, [user, gameId, loadGame]);

  // Determine current player perspective
  const isHumanWhite = Boolean(game?.whitePlayerId && game.whitePlayerId._id === user?.id);
  const humanColor: PieceColor = isHumanWhite ? 'w' : 'b';

  // Chess.js instance for current position
  const currentFen = game?.currentFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const chess = new Chess(currentFen);
  const currentTurn = chess.turn(); // 'w' | 'b'

  const isAiGame = game?.gameMode === 'AI';
  const isAiTurn =
    isAiGame &&
    game?.result === 'IN_PROGRESS' &&
    ((game.whiteIsAI && currentTurn === 'w') || (game.blackIsAI && currentTurn === 'b'));

  // Trigger AI move when it is AI's turn
  const executeAiTurn = useCallback(
    async (fenToAnalyze: string, difficulty: AiDifficulty) => {
      if (isAiMovingRef.current) return;
      isAiMovingRef.current = true;

      try {
        const bestMove = await getAiMove(fenToAnalyze, difficulty);
        if (bestMove) {
          const moveRes = await GameService.makeMove(gameId, {
            from: bestMove.from,
            to: bestMove.to,
            promotion: bestMove.promotion,
          });

          if (moveRes.success && moveRes.game) {
            setGame(moveRes.game);
            if (moveRes.isTerminal) {
              setShowCompletionModal(true);
            }
          }
        }
      } catch (err) {
        console.error('Failed to execute AI turn:', err);
      } finally {
        isAiMovingRef.current = false;
      }
    },
    [gameId, getAiMove]
  );

  useEffect(() => {
    if (isAiTurn && game && game.result === 'IN_PROGRESS' && !isAiMovingRef.current) {
      const diff = (game.aiLevel as AiDifficulty) || 'MEDIUM';
      // Slight brief human-like pause before AI makes move
      const timer = setTimeout(() => {
        executeAiTurn(game.currentFen, diff);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [isAiTurn, game, executeAiTurn]);

  // Player move submission
  const handlePlayerMove = async (move: { from: string; to: string; promotion?: 'q' | 'r' | 'b' | 'n' }) => {
    if (isSubmittingMove || isThinking || !game || game.result !== 'IN_PROGRESS') return;

    setIsSubmittingMove(true);
    setErrorMessage(null);

    try {
      const res = await GameService.makeMove(gameId, move);
      if (res.success && res.game) {
        setGame(res.game);

        if (res.isTerminal) {
          setShowCompletionModal(true);
        }
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Invalid or rejected move');
    } finally {
      setIsSubmittingMove(false);
    }
  };

  // Player resignation
  const handleResign = async () => {
    if (!game || game.result !== 'IN_PROGRESS') return;

    try {
      const res = await GameService.resign(gameId);
      if (res.success && res.game) {
        setGame(res.game);
        setShowCompletionModal(true);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Could not resign game');
    }
  };

  if (isLoading || isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Entering Chess Arena...</p>
        </div>
      </div>
    );
  }

  if (errorMessage && !game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-rose-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-black text-slate-900 text-lg">Unable to Access Match</h3>
          <p className="text-xs text-slate-600">{errorMessage}</p>
          <div className="flex gap-2 justify-center pt-2">
            <button
              onClick={loadGame}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs"
            >
              Retry
            </button>
            <Link
              href="/play"
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
            >
              New Match
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const lastMove = game?.moves && game.moves.length > 0 ? game.moves[game.moves.length - 1] : undefined;
  const isTerminal = game?.result !== 'IN_PROGRESS';

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Crown className="w-5 h-5 fill-current text-amber-300" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-lg leading-tight block">
                Kids Chess <span className="text-brand-600">Arena</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 block -mt-0.5">
                Match #{gameId.slice(-6).toUpperCase()}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/games"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Chess Arena */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold text-center">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Board + Status + Controls (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Game Status Banner */}
            <GameStatusBanner
              turn={currentTurn}
              playerColor={boardOrientation}
              isAiGame={isAiGame}
              isAiTurn={isAiTurn}
              isThinking={isThinking}
              inCheck={chess.isCheck()}
              isTerminal={isTerminal}
              resultMessage={
                game?.result === 'WHITE_WON'
                  ? 'White achieved victory!'
                  : game?.result === 'BLACK_WON'
                  ? 'Black achieved victory!'
                  : game?.result === 'DRAW'
                  ? 'Game concluded in a draw.'
                  : undefined
              }
            />

            {/* Reusable ChessBoard */}
            <ChessBoard
              fen={currentFen}
              orientation={boardOrientation}
              playerColor={isAiGame ? humanColor : undefined}
              disabled={isTerminal || isAiTurn || isSubmittingMove}
              lastMove={lastMove ? { from: lastMove.from, to: lastMove.to } : undefined}
              onMove={handlePlayerMove}
            />

            {/* Game Controls: Flip, Resign, New Game */}
            <GameControls
              onFlipBoard={() => setBoardOrientation((prev) => (prev === 'white' ? 'black' : 'white'))}
              onResign={handleResign}
              isTerminal={isTerminal}
              disabled={isSubmittingMove || isThinking}
            />
          </div>

          {/* Right Column: Move History & Match Details (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Match Information Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Match Participants</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* White Player */}
                <div
                  className={`p-3 rounded-2xl border ${
                    currentTurn === 'w' && !isTerminal
                      ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">♔</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">White</p>
                      <p className="font-black text-xs text-slate-900 truncate">
                        {game?.whiteIsAI ? 'Robot (AI)' : game?.whitePlayerId?.username || 'Player 1'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Black Player */}
                <div
                  className={`p-3 rounded-2xl border ${
                    currentTurn === 'b' && !isTerminal
                      ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">♚</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Black</p>
                      <p className="font-black text-xs text-slate-900 truncate">
                        {game?.blackIsAI ? 'Robot (AI)' : game?.blackPlayerId?.username || 'Player 2'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {isAiGame && game?.aiLevel && (
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
                  <span className="flex items-center gap-1 font-bold text-slate-600">
                    <Bot className="w-4 h-4 text-indigo-600" />
                    <span>Robot Skill: {game.aiLevel}</span>
                  </span>
                  <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    +75 Max XP
                  </span>
                </div>
              )}
            </div>

            {/* Move History Panel */}
            <MoveHistory moves={game?.moves || []} />
          </div>
        </div>
      </main>

      {/* Game Completion Celebration Modal */}
      <GameCompletionModal
        isOpen={showCompletionModal}
        result={game?.result || 'IN_PROGRESS'}
        terminationReason={game?.terminationReason || null}
        playerColor={boardOrientation}
        onClose={() => setShowCompletionModal(false)}
      />
    </div>
  );
}

