import { z } from 'zod';

export const puzzleQuerySchema = z.object({
  theme: z
    .enum([
      'FORK',
      'PIN',
      'SKEWER',
      'CHECKMATE',
      'DEFLECTION',
      'PATTERN_RECOGNITION',
      'DISCOVERED_ATTACK',
      'DOUBLE_ATTACK',
      'MATE_IN_ONE',
      'MATE_IN_TWO',
      'TACTICAL',
    ])
    .optional(),
  minDifficulty: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  maxDifficulty: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  lessonId: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(50, Math.max(1, parseInt(val, 10) || 10)) : 10)),
});

export const puzzleMoveSchema = z.object({
  from: z.string().regex(/^[a-h][1-8]$/, 'Square must be in standard algebraic notation (e.g. e2)'),
  to: z.string().regex(/^[a-h][1-8]$/, 'Square must be in standard algebraic notation (e.g. e4)'),
  promotion: z.enum(['q', 'r', 'b', 'n']).optional(),
});

export type PuzzleMoveInput = z.infer<typeof puzzleMoveSchema>;

