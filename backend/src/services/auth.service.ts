import { Types } from 'mongoose';
import {
  User,
  StudentProfile,
  TeacherProfile,
  ParentProfile,
  IUser,
} from '../models';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, generateParentLinkCode } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../schemas/auth.schemas';
import { AppError } from '../middleware/errorHandler';

function createAuthError(message: string, statusCode: number): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  return error;
}

export function sanitizeUser(user: IUser) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email || null,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export class AuthService {
  /**
   * Register a new user and generate the corresponding role profile.
   */
  static async register(input: RegisterInput) {
    // 1. Verify username uniqueness
    const existingUsername = await User.findOne({ username: input.username });
    if (existingUsername) {
      throw createAuthError('Username is already taken. Please choose another.', 409);
    }

    // 2. Verify email uniqueness if provided
    if (input.email && input.email.trim() !== '') {
      const existingEmail = await User.findOne({ email: input.email.toLowerCase() });
      if (existingEmail) {
        throw createAuthError('Email address is already in use.', 409);
      }
    }

    // 3. Hash password securely
    const passwordHash = await hashPassword(input.password);

    // 4. Create User document
    const user = await User.create({
      username: input.username,
      email: input.email && input.email.trim() !== '' ? input.email.toLowerCase() : undefined,
      passwordHash,
      role: input.role,
      isActive: true,
    });

    // 5. Create role-specific profile
    let profile = null;

    if (input.role === 'STUDENT') {
      const parentLinkCode = generateParentLinkCode();
      profile = await StudentProfile.create({
        userId: user._id,
        displayName: input.displayName,
        avatar: input.avatar || 'knight_blue',
        chessRating: 500,
        xp: 0,
        level: 1,
        parentLinkCode,
      });
    } else if (input.role === 'PARENT') {
      profile = await ParentProfile.create({
        userId: user._id,
        displayName: input.displayName,
        linkedStudentIds: [],
        notificationPreferences: {
          emailAlerts: true,
          weeklyProgressReport: true,
          streakReminders: true,
        },
      });
    } else if (input.role === 'TEACHER') {
      profile = await TeacherProfile.create({
        userId: user._id,
        displayName: input.displayName,
        title: input.title || 'Chess Instructor',
        bio: input.bio || '',
      });
    }

    // 6. Generate session JWT
    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
    });

    return {
      user: sanitizeUser(user),
      profile,
      token,
    };
  }

  /**
   * Authenticate credentials and return safe user & profile.
   */
  static async login(input: LoginInput) {
    // 1. Find user and explicitly select passwordHash
    const user = await User.findOne({ username: input.username }).select('+passwordHash');
    if (!user || !user.isActive) {
      throw createAuthError('Invalid username or password.', 401);
    }

    // 2. Verify password with bcrypt
    const isPasswordValid = await comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw createAuthError('Invalid username or password.', 401);
    }

    // 3. Load role-specific profile
    let profile = null;
    if (user.role === 'STUDENT') {
      profile = await StudentProfile.findOne({ userId: user._id });
    } else if (user.role === 'PARENT') {
      profile = await ParentProfile.findOne({ userId: user._id });
    } else if (user.role === 'TEACHER') {
      profile = await TeacherProfile.findOne({ userId: user._id });
    }

    // 4. Generate JWT
    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
    });

    return {
      user: sanitizeUser(user),
      profile,
      token,
    };
  }

  /**
   * Retrieve current user and role profile safely.
   */
  static async getCurrentUser(userId: string) {
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      throw createAuthError('User session expired or not found.', 404);
    }

    let profile = null;
    if (user.role === 'STUDENT') {
      profile = await StudentProfile.findOne({ userId: user._id });
    } else if (user.role === 'PARENT') {
      profile = await ParentProfile.findOne({ userId: user._id });
    } else if (user.role === 'TEACHER') {
      profile = await TeacherProfile.findOne({ userId: user._id });
    }

    return {
      user: sanitizeUser(user),
      profile,
    };
  }

  /**
   * Link a parent account to a student using the student's unique parentLinkCode.
   */
  static async linkParent(parentUserId: string, parentLinkCode: string) {
    const cleanCode = parentLinkCode.trim().toUpperCase();

    // 1. Find student by parentLinkCode
    const studentProfile = await StudentProfile.findOne({ parentLinkCode: cleanCode });
    if (!studentProfile) {
      throw createAuthError(
        'Invalid parent linking code. Please check the 8-character code with your child.',
        404
      );
    }

    // 2. Find parent profile
    const parentProfile = await ParentProfile.findOne({ userId: parentUserId });
    if (!parentProfile) {
      throw createAuthError('Parent profile not found.', 404);
    }

    // 3. Prevent duplicate links
    const isAlreadyLinked =
      (studentProfile.parentUserId && studentProfile.parentUserId.toString() === parentUserId) ||
      parentProfile.linkedStudentIds.some((id) => id.toString() === studentProfile._id.toString());

    if (isAlreadyLinked) {
      throw createAuthError('This student is already linked to your account.', 400);
    }

    // 4. Associate student with parent
    studentProfile.parentUserId = new Types.ObjectId(parentUserId);
    await studentProfile.save();

    // 5. Add student to parent's linked list
    parentProfile.linkedStudentIds.push(studentProfile._id as Types.ObjectId);
    await parentProfile.save();

    return {
      message: 'Student account linked successfully.',
      linkedStudent: {
        id: studentProfile._id.toString(),
        displayName: studentProfile.displayName,
        chessRating: studentProfile.chessRating,
        level: studentProfile.level,
      },
    };
  }
}
