import { z } from 'zod';

export const lessonQuerySchema = z.object({
  category: z
    .enum([
      'CHESS_BASICS',
      'PIECE_MOVEMENT',
      'OPENINGS',
      'TACTICS',
      'ENDGAMES',
      'PATTERN_RECOGNITION',
      'STRATEGY',
    ])
    .optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
});

export const lessonStepAnswerSchema = z.object({
  stepNumber: z.number().int().min(1),
  selectedAnswer: z.string().optional(),
  interactiveMove: z
    .object({
      from: z.string().regex(/^[a-h][1-8]$/),
      to: z.string().regex(/^[a-h][1-8]$/),
      promotion: z.enum(['q', 'r', 'b', 'n']).optional(),
    })
    .optional(),
});

export type LessonStepAnswerInput = z.infer<typeof lessonStepAnswerSchema>;
