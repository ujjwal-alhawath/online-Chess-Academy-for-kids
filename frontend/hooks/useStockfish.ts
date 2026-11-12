import { useRef, useEffect, useState, useCallback } from 'react';
import { StockfishService, BestMoveResult } from '../services/stockfish.service';
import { AiDifficulty } from '../types/chess.types';

export function useStockfish() {
  const serviceRef = useRef<StockfishService | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);

  useEffect(() => {
    serviceRef.current = new StockfishService();

    return () => {
      if (serviceRef.current) {
        serviceRef.current.terminate();
        serviceRef.current = null;
      }
    };
  }, []);

  const getAiMove = useCallback(
    async (fen: string, difficulty: AiDifficulty = 'MEDIUM'): Promise<BestMoveResult | null> => {
      if (!serviceRef.current) {
        serviceRef.current = new StockfishService();
      }

      setIsThinking(true);
      setEngineError(null);

      try {
        const result = await serviceRef.current.getBestMove(fen, difficulty);
        return result;
      } catch (err) {
        console.error('Stockfish move computation error:', err);
        setEngineError(err instanceof Error ? err.message : 'Engine calculation error');
        return null;
      } finally {
        setIsThinking(false);
      }
    },
    []
  );

  return {
    isThinking,
    engineError,
    getAiMove,
  };
}

