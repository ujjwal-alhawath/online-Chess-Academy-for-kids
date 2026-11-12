import { z } from 'zod';

export const createGameSchema = z.object({
  gameMode: z.enum(['AI', 'PRACTICE', 'MULTIPLAYER']).default('AI'),
  aiLevel: z.enum(['BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'ADVANCED']).optional().default('EASY'),
  playerColor: z.enum(['white', 'black', 'random']).default('white'),
  timeControl: z
    .object({
      initialMinutes: z.number().int().min(1).max(60).default(10),
      incrementSeconds: z.number().int().min(0).max(60).default(0),
    })
    .optional(),
});

export const makeMoveSchema = z.object({
  from: z.string().regex(/^[a-h][1-8]$/, 'Square must be in standard algebraic notation (e.g. e2)'),
  to: z.string().regex(/^[a-h][1-8]$/, 'Square must be in standard algebraic notation (e.g. e4)'),
  promotion: z.enum(['q', 'r', 'b', 'n']).optional(),
});

export const gameHistoryQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  limit: z.string().optional().transform((val) => (val ? Math.min(50, Math.max(1, parseInt(val, 10) || 10)) : 10)),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type MakeMoveInput = z.infer<typeof makeMoveSchema>;

