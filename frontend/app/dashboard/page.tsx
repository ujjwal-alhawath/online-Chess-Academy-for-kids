'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Crown,
  LogOut,
  Shield,
  GraduationCap,
  Sparkles,
  Link2,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Flame,
  Award,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  StudentProfileData,
  ParentProfileData,
  TeacherProfileData,
} from '@/services/auth.service';

export default function DashboardProtectedFoundation() {
  const router = useRouter();
  const { user, profile, isLoading, logout, linkParent } = useAuth();

  const [parentCodeInput, setParentCodeInput] = useState('');
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);

  // Authentication Guard: Redirect to /login if unauthenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err: unknown) {
      console.error('Logout error:', err);
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkSuccess(null);
    setLinkError(null);

    if (!parentCodeInput.trim()) {
      setLinkError('Please enter an 8-character parent link code.');
      return;
    }

    try {
      setIsLinking(true);
      const res = await linkParent(parentCodeInput.trim());
      setLinkSuccess(res.message || 'Student linked successfully!');
      setParentCodeInput('');
    } catch (err: unknown) {
      setLinkError(
        err instanceof Error ? err.message : 'Failed to link student. Please verify the code.'
      );
    } finally {
      setIsLinking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600">Verifying Academy Session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirecting via useEffect
  }

  // Type-narrowed profiles
  const studentProfile = user.role === 'STUDENT' ? (profile as StudentProfileData | null) : null;
  const parentProfile = user.role === 'PARENT' ? (profile as ParentProfileData | null) : null;
  const teacherProfile = user.role === 'TEACHER' ? (profile as TeacherProfileData | null) : null;
  const displayName = profile?.displayName ? String(profile.displayName) : user.username;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Crown className="w-5 h-5 fill-current text-amber-300" />
            </div>
            <span className="font-extrabold text-slate-900 text-lg">
              Kids Chess <span className="text-brand-600">Academy</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Role: {user.role}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Welcome Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Authenticated Session Active</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Welcome, {displayName}! 👋
            </h1>
            <p className="text-sm text-slate-600">
              Account Role:{' '}
              <span className="font-extrabold text-slate-900 uppercase">{user.role}</span>
              {user.email && ` • ${user.email}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-inner">
              {user.role === 'STUDENT' ? '🦁' : user.role === 'PARENT' ? '🛡️' : '🎓'}
            </div>
          </div>
        </div>

        {/* Role-Specific Foundation Cards */}
        {user.role === 'STUDENT' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-2">
              <Trophy className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Chess Rating</p>
              <p className="text-3xl font-black text-slate-900">{studentProfile?.chessRating || 500}</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-2">
              <Award className="w-8 h-8 text-brand-600 mx-auto" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Academy Level</p>
              <p className="text-3xl font-black text-slate-900">Level {studentProfile?.level || 1}</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-2">
              <Flame className="w-8 h-8 text-orange-500 mx-auto" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Learning Streak</p>
              <p className="text-3xl font-black text-slate-900">{studentProfile?.currentStreak || 0} Days</p>
            </div>

            {/* Parent Linking Card for Student */}
            {studentProfile?.parentLinkCode && (
              <div className="md:col-span-3 bg-gradient-to-r from-brand-50 to-indigo-50 rounded-3xl p-6 border border-brand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-brand-600" />
                    Your Parent Link Code
                  </h3>
                  <p className="text-xs text-slate-600">
                    Share this code with your parents so they can connect and celebrate your learning milestones!
                  </p>
                </div>
                <div className="px-5 py-3 rounded-2xl bg-white border-2 border-brand-400 font-mono text-xl font-black text-brand-700 tracking-widest text-center shadow-sm select-all">
                  {studentProfile.parentLinkCode}
                </div>
              </div>
            )}
          </div>
        )}

        {user.role === 'PARENT' && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Link2 className="w-6 h-6 text-emerald-600" />
                Connect Your Child&apos;s Academy Account
              </h2>
              <p className="text-sm text-slate-600">
                Enter the 8-character parent link code displayed on your child&apos;s account screen.
              </p>
            </div>

            {linkSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{linkSuccess}</span>
              </div>
            )}

            {linkError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <span>{linkError}</span>
              </div>
            )}

            <form onSubmit={handleLinkSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={parentCodeInput}
                onChange={(e) => setParentCodeInput(e.target.value.toUpperCase())}
                placeholder="Enter 8-character code (e.g. A1B2C3D4)"
                maxLength={12}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl text-sm font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={isLinking}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50"
              >
                {isLinking ? 'Linking...' : 'Connect Student'}
              </button>
            </form>

            {parentProfile?.linkedStudentIds && parentProfile.linkedStudentIds.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Connected Students ({parentProfile.linkedStudentIds.length})
                </p>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                  ✓ {parentProfile.linkedStudentIds.length} student account(s) actively linked for monitoring.
                </div>
              </div>
            )}
          </div>
        )}

        {user.role === 'TEACHER' && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-purple-600" />
              Teacher Workspace Foundation
            </h2>
            <p className="text-sm text-slate-600">
              Instructor Title: <strong className="text-slate-900">{teacherProfile?.title || 'Chess Coach'}</strong>
            </p>
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 font-medium">
              Teacher cohorts, lesson publishing, and tournament organization tools will unlock in Phase 8-10.
            </div>
          </div>
        )}

        {/* Next phases notice */}
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-500 text-center">
          Phase 3 Authentication, Authorization, RBAC &amp; Account Linking Foundation active. Full role dashboards and gamification modules will be populated in subsequent phases.
        </div>
      </main>
    </div>
  );
}
