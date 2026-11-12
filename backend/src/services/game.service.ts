import { Types } from 'mongoose';
import { Chess } from 'chess.js';
import { Game, IGame, StudentProfile, GameMode, AiLevel } from '../models';
import { GamificationService } from './gamification.service';

export interface CreateGameParams {
  userId: string;
  gameMode?: GameMode;
  aiLevel?: AiLevel;
  playerColor?: 'white' | 'black' | 'random';
  timeControl?: {
    initialMinutes?: number;
    incrementSeconds?: number;
  };
}

export interface MakeMoveParams {
  gameId: string;
  userId: string;
  from: string;
  to: string;
  promotion?: 'q' | 'r' | 'b' | 'n';
}

export class GameService {
  /**
   * Create a new game instance for an authenticated student.
   */
  static async createGame(params: CreateGameParams): Promise<IGame> {
    const { userId, gameMode = 'AI', aiLevel = 'EASY', playerColor = 'white', timeControl } = params;

    let chosenColor = playerColor;
    if (chosenColor === 'random') {
      chosenColor = Math.random() < 0.5 ? 'white' : 'black';
    }

    const userObjectId = new Types.ObjectId(userId);

    let whitePlayerId: Types.ObjectId | null = null;
    let blackPlayerId: Types.ObjectId | null = null;
    let whiteIsAI = false;
    let blackIsAI = false;

    if (gameMode === 'AI') {
      if (chosenColor === 'white') {
        whitePlayerId = userObjectId;
        whiteIsAI = false;
        blackPlayerId = null;
        blackIsAI = true;
      } else {
        whitePlayerId = null;
        whiteIsAI = true;
        blackPlayerId = userObjectId;
        blackIsAI = false;
      }
    } else {
      // PRACTICE or FRIEND mode
      whitePlayerId = userObjectId;
      whiteIsAI = false;
      blackPlayerId = null;
      blackIsAI = false;
    }

    const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    const game = await Game.create({
      whitePlayerId,
      blackPlayerId,
      whiteIsAI,
      blackIsAI,
      aiLevel: gameMode === 'AI' ? aiLevel : null,
      gameMode,
      timeControl: {
        initialMinutes: timeControl?.initialMinutes || 10,
        incrementSeconds: timeControl?.incrementSeconds || 0,
      },
      initialFen,
      currentFen: initialFen,
      moves: [],
      pgn: '',
      result: 'IN_PROGRESS',
      terminationReason: null,
      startedAt: new Date(),
      completedAt: null,
    });

    return game;
  }

  /**
   * Retrieve game by ID, with participant/admin authorization check.
   */
  static async getGameById(gameId: string, userId: string, userRole?: string): Promise<IGame> {
    if (!Types.ObjectId.isValid(gameId)) {
      const err = new Error('Invalid game ID format');
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    const game = await Game.findById(gameId)
      .populate('whitePlayerId', 'username email')
      .populate('blackPlayerId', 'username email');

    if (!game) {
      const err = new Error('Game not found');
      (err as unknown as { statusCode: number }).statusCode = 404;
      throw err;
    }

    // Authorization check: User must be a participant or an ADMIN
    const isWhite = game.whitePlayerId && game.whitePlayerId._id?.toString() === userId;
    const isBlack = game.blackPlayerId && game.blackPlayerId._id?.toString() === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isWhite && !isBlack && !isAdmin) {
      const err = new Error('Access denied: You are not an authorized participant in this game');
      (err as unknown as { statusCode: number }).statusCode = 403;
      throw err;
    }

    return game;
  }

  /**
   * Server-side authoritative move validation & state update.
   */
  static async makeMove(params: MakeMoveParams): Promise<{
    game: IGame;
    move: {
      san: string;
      from: string;
      to: string;
      piece: string;
      promotion?: string;
    };
    isTerminal: boolean;
    result: string;
  }> {
    const { gameId, userId, from, to, promotion } = params;

    if (!Types.ObjectId.isValid(gameId)) {
      const err = new Error('Invalid game ID format');
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    const game = await Game.findById(gameId);
    if (!game) {
      const err = new Error('Game not found');
      (err as unknown as { statusCode: number }).statusCode = 404;
      throw err;
    }

    if (game.result !== 'IN_PROGRESS') {
      const err = new Error(`Game has already finished with result: ${game.result}`);
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    // 1. Reconstruct current chess state
    const chess = new Chess(game.currentFen);
    const turn = chess.turn(); // 'w' | 'b'

    // 2. Validate current turn authorization
    const isWhite = game.whitePlayerId?.toString() === userId;
    const isBlack = game.blackPlayerId?.toString() === userId;

    if (turn === 'w') {
      if (game.whiteIsAI) {
        // AI turn: any participant in the game can relay AI move, or it's verified as AI
        if (!isBlack) {
          const err = new Error('It is not your turn to submit this move');
          (err as unknown as { statusCode: number }).statusCode = 403;
          throw err;
        }
      } else if (!isWhite) {
        const err = new Error('It is White’s turn to move');
        (err as unknown as { statusCode: number }).statusCode = 403;
        throw err;
      }
    } else {
      // turn === 'b'
      if (game.blackIsAI) {
        // AI turn: white player relaying AI move
        if (!isWhite) {
          const err = new Error('It is not your turn to submit this move');
          (err as unknown as { statusCode: number }).statusCode = 403;
          throw err;
        }
      } else if (!isBlack) {
        const err = new Error('It is Black’s turn to move');
        (err as unknown as { statusCode: number }).statusCode = 403;
        throw err;
      }
    }

    // 3. Authoritative chess rule validation
    let moveResult;
    try {
      moveResult = chess.move({
        from,
        to,
        promotion: promotion || undefined,
      });
    } catch {
      const err = new Error(`Illegal chess move from ${from} to ${to}`);
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    if (!moveResult) {
      const err = new Error(`Illegal chess move from ${from} to ${to}`);
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    // 4. Update authoritative board state
    const newFen = chess.fen();
    const newPgn = chess.pgn();

    game.currentFen = newFen;
    game.pgn = newPgn;
    game.moves.push({
      moveNumber: game.moves.length + 1,
      from: moveResult.from,
      to: moveResult.to,
      piece: moveResult.piece,
      san: moveResult.san,
      promotion: moveResult.promotion,
    });

    // 5. Evaluate terminal game states
    let isTerminal = false;
    if (chess.isCheckmate()) {
      isTerminal = true;
      // Winner is the side that just moved!
      game.result = turn === 'w' ? 'WHITE_WON' : 'BLACK_WON';
      game.terminationReason = 'CHECKMATE';
      game.completedAt = new Date();
    } else if (
      chess.isDraw() ||
      chess.isStalemate() ||
      chess.isThreefoldRepetition() ||
      chess.isInsufficientMaterial()
    ) {
      isTerminal = true;
      game.result = 'DRAW';
      game.terminationReason = chess.isStalemate() ? 'STALEMATE' : 'DRAW_AGREED';
      game.completedAt = new Date();
    }

    await game.save();

    // 6. Gamification & Stat Integration upon terminal completion
    if (isTerminal && game.gameMode === 'AI') {
      const humanPlayerId = game.whiteIsAI ? game.blackPlayerId : game.whitePlayerId;
      if (humanPlayerId) {
        const student = await StudentProfile.findOne({ userId: humanPlayerId });
        if (student) {
          const gameIdStr = game._id.toString();
          const humanWon =
            (game.result === 'WHITE_WON' && !game.whiteIsAI) ||
            (game.result === 'BLACK_WON' && !game.blackIsAI);

          // Award +25 XP for game completion (idempotent via AI_GAME_FINISH)
          await GamificationService.awardXp(
            student._id,
            25,
            'Completed AI chess match',
            'AI_GAME_FINISH',
            gameIdStr
          );

          // Award +50 XP for victory (idempotent via AI_GAME_WIN)
          if (humanWon) {
            await GamificationService.awardXp(
              student._id,
              50,
              'Victory against AI chess opponent',
              'AI_GAME_WIN',
              gameIdStr
            );
          }

          // Update student match stats
          student.gamesPlayed += 1;
          if (humanWon) {
            student.gamesWon += 1;
          } else if (game.result === 'DRAW') {
            student.gamesDrawn += 1;
          } else {
            student.gamesLost += 1;
          }
          await student.save();

          // Increment daily activity streak
          await GamificationService.recordStudentActivity(student._id);
        }
      }
    }

    await game.populate('whitePlayerId', 'username email');
    await game.populate('blackPlayerId', 'username email');

    return {
      game,
      move: {
        san: moveResult.san,
        from: moveResult.from,
        to: moveResult.to,
        piece: moveResult.piece,
        promotion: moveResult.promotion,
      },
      isTerminal,
      result: game.result,
    };
  }

  /**
   * Resign active game.
   */
  static async resignGame(gameId: string, userId: string): Promise<IGame> {
    if (!Types.ObjectId.isValid(gameId)) {
      const err = new Error('Invalid game ID format');
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    const game = await Game.findById(gameId);
    if (!game) {
      const err = new Error('Game not found');
      (err as unknown as { statusCode: number }).statusCode = 404;
      throw err;
    }

    if (game.result !== 'IN_PROGRESS') {
      const err = new Error('Game is not in progress');
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    const isWhite = game.whitePlayerId?.toString() === userId;
    const isBlack = game.blackPlayerId?.toString() === userId;

    if (!isWhite && !isBlack) {
      const err = new Error('You are not a participant in this game');
      (err as unknown as { statusCode: number }).statusCode = 403;
      throw err;
    }

    // If white resigns, black wins; if black resigns, white wins
    game.result = isWhite ? 'BLACK_WON' : 'WHITE_WON';
    game.terminationReason = 'RESIGNATION';
    game.completedAt = new Date();
    await game.save();

    // Gamification & Stat Integration for completion
    if (game.gameMode === 'AI') {
      const student = await StudentProfile.findOne({ userId });
      if (student) {
        const gameIdStr = game._id.toString();
        // Award completion XP (encouragement for finishing game)
        await GamificationService.awardXp(
          student._id,
          25,
          'Completed AI chess match',
          'AI_GAME_FINISH',
          gameIdStr
        );

        student.gamesPlayed += 1;
        student.gamesLost += 1;
        await student.save();

        await GamificationService.recordStudentActivity(student._id);
      }
    }

    return game;
  }

  /**
   * Fetch paginated game history for authenticated user.
   */
  static async getGameHistory(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    games: IGame[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const userObjectId = new Types.ObjectId(userId);
    const query = {
      $or: [{ whitePlayerId: userObjectId }, { blackPlayerId: userObjectId }],
    };

    const skip = (page - 1) * limit;

    const [games, total] = await Promise.all([
      Game.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('whitePlayerId', 'username email')
        .populate('blackPlayerId', 'username email'),
      Game.countDocuments(query),
    ]);

    return {
      games,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

