import { z } from 'zod';

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username cannot exceed 30 characters')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores'
      ),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password cannot exceed 100 characters'),
    role: z.enum(['STUDENT', 'TEACHER', 'PARENT'], {
      errorMap: () => ({
        message: 'Role must be STUDENT, TEACHER, or PARENT. Admin registration is prohibited.',
      }),
    }),
    displayName: z
      .string()
      .trim()
      .min(2, 'Display name must be at least 2 characters')
      .max(50, 'Display name cannot exceed 50 characters'),
    email: z
      .string()
      .trim()
      .email('Please provide a valid email address')
      .optional()
      .or(z.literal('')),
    avatar: z.string().trim().optional(),
    title: z.string().trim().max(60).optional(),
    bio: z.string().trim().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    // Parents and Teachers MUST supply a valid email address
    if ((data.role === 'PARENT' || data.role === 'TEACHER') && (!data.email || data.email.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email'],
        message: `Email is required for ${data.role.toLowerCase()} accounts`,
      });
    }
  });

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Username is required'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const linkParentSchema = z.object({
  parentLinkCode: z
    .string()
    .trim()
    .min(6, 'Parent link code must be at least 6 characters')
    .max(12, 'Parent link code cannot exceed 12 characters')
    .toUpperCase(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type LinkParentInput = z.infer<typeof linkParentSchema>;

