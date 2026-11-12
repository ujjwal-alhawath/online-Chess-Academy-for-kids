import { Chess } from 'chess.js';
import { AiDifficulty } from '../types/chess.types';

export interface BestMoveResult {
  from: string;
  to: string;
  promotion?: 'q' | 'r' | 'b' | 'n';
}

interface DifficultyConfig {
  skillLevel: number;
  depth: number;
  maxMoveTime: number;
}

const DIFFICULTY_CONFIGS: Record<AiDifficulty, DifficultyConfig> = {
  BEGINNER: { skillLevel: 0, depth: 2, maxMoveTime: 400 },
  MEDIUM: { skillLevel: 6, depth: 6, maxMoveTime: 900 },
  HARD: { skillLevel: 20, depth: 12, maxMoveTime: 1800 },
};

export class StockfishService {
  private worker: Worker | null = null;
  private isReady: boolean = false;
  private pendingResolver: ((res: BestMoveResult) => void) | null = null;
  private pendingRejecter: ((err: Error) => void) | null = null;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor() {
    this.initWorker();
  }

  private initWorker(): void {
    if (typeof window === 'undefined') return;

    try {
      this.worker = new Worker('/stockfish/stockfish.js');

      this.worker.onmessage = (e: MessageEvent) => {
        const line = typeof e.data === 'string' ? e.data : '';

        if (line === 'uciok' || line === 'readyok') {
          this.isReady = true;
        }

        if (line.startsWith('bestmove')) {
          if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
          }

          const parts = line.split(' ');
          const moveString = parts[1]; // e.g. 'e7e5' or 'e7e8q' or '(none)'

          if (!moveString || moveString === '(none)') {
            if (this.pendingRejecter) {
              this.pendingRejecter(new Error('Stockfish returned no move (terminal position)'));
            }
          } else {
            const from = moveString.substring(0, 2);
            const to = moveString.substring(2, 4);
            const rawPromo = moveString.length > 4 ? moveString.charAt(4).toLowerCase() : undefined;
            const promotion = rawPromo && ['q', 'r', 'b', 'n'].includes(rawPromo)
              ? (rawPromo as 'q' | 'r' | 'b' | 'n')
              : undefined;

            if (this.pendingResolver) {
              this.pendingResolver({ from, to, promotion });
            }
          }

          this.pendingResolver = null;
          this.pendingRejecter = null;
        }
      };

      this.worker.onerror = (err) => {
        console.warn('Stockfish Worker warning/error:', err);
      };

      // Initialize UCI
      this.worker.postMessage('uci');
      this.worker.postMessage('isready');
    } catch (err) {
      console.warn('Could not initialize Stockfish Web Worker:', err);
      this.worker = null;
    }
  }

  /**
   * Request engine to compute the best move for a given FEN and difficulty.
   */
  public async getBestMove(fen: string, difficulty: AiDifficulty = 'MEDIUM'): Promise<BestMoveResult> {
    const config = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.MEDIUM;

    const activeWorker = this.worker;
    if (!activeWorker) {
      return this.computeFallbackMove(fen);
    }

    return new Promise<BestMoveResult>((resolve, reject) => {
      this.pendingResolver = resolve;
      this.pendingRejecter = reject;

      // 6-second timeout safety guard: fallback if worker hangs
      this.timeoutId = setTimeout(() => {
        if (this.pendingResolver) {
          console.warn('Stockfish timeout exceeded, using chess.js safety move.');
          const fallback = this.computeFallbackMove(fen);
          this.pendingResolver(fallback);
          this.pendingResolver = null;
          this.pendingRejecter = null;
        }
      }, 6000);

      try {
        activeWorker.postMessage(`setoption name Skill Level value ${config.skillLevel}`);
        activeWorker.postMessage(`position fen ${fen}`);
        activeWorker.postMessage(`go depth ${config.depth} movetime ${config.maxMoveTime}`);
      } catch {
        const fallback = this.computeFallbackMove(fen);
        resolve(fallback);
      }
    });
  }

  /**
   * Fast, reliable client-side fallback move generator using chess.js
   */
  private computeFallbackMove(fen: string): BestMoveResult {
    const chess = new Chess(fen);
    const moves = chess.moves({ verbose: true });

    if (moves.length === 0) {
      throw new Error('No legal moves available in this position');
    }

    // Prefer captures or checks, otherwise random legal move
    const aggressiveMoves = moves.filter((m) => m.captured || chess.isCheck());
    const chosen = aggressiveMoves.length > 0
      ? aggressiveMoves[Math.floor(Math.random() * aggressiveMoves.length)]
      : moves[Math.floor(Math.random() * moves.length)];

    return {
      from: chosen.from,
      to: chosen.to,
      promotion: chosen.promotion as 'q' | 'r' | 'b' | 'n' | undefined,
    };
  }

  /**
   * Terminate Web Worker cleanly when unmounted to free memory.
   */
  public terminate(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.worker) {
      try {
        this.worker.postMessage('quit');
        this.worker.terminate();
      } catch {
        // Ignored
      }
      this.worker = null;
    }
    this.pendingResolver = null;
    this.pendingRejecter = null;
  }
}
