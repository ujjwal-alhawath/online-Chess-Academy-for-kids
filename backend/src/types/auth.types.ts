import { UserRole } from '../models';

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
}

export interface AuthJwtPayload {
  userId: string;
  role: UserRole;
}

// Extend Express Request interface to include authenticated user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

