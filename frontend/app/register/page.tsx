'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Crown,
  Lock,
  User,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Shield,
  GraduationCap,
  Smile,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type SelectedRole = 'STUDENT' | 'PARENT' | 'TEACHER';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [role, setRole] = useState<SelectedRole>('STUDENT');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !displayName.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-check.');
      return;
    }

    if ((role === 'PARENT' || role === 'TEACHER') && !email.trim()) {
      setError(`Email address is required for ${role.toLowerCase()} accounts.`);
      return;
    }

    try {
      setIsSubmitting(true);
      await register({
        username: username.trim(),
        displayName: displayName.trim(),
        role,
        password,
        email: email.trim() || undefined,
        title: role === 'TEACHER' ? title.trim() : undefined,
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-brand-50/60 via-white to-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 group mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
            <Crown className="w-6 h-6 fill-current text-amber-300" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            Kids Chess <span className="text-brand-600">Academy</span>
          </span>
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Join The Academy 🚀</h1>
        <p className="mt-2 text-sm text-slate-600">
          Select your account type to get started on your strategic journey.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 sm:rounded-3xl border border-slate-100 sm:px-10">
          
          {/* Role selector tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => { setRole('STUDENT'); setError(null); }}
              className={`flex flex-col items-center justify-center py-3 rounded-xl text-xs font-extrabold transition-all ${
                role === 'STUDENT'
                  ? 'bg-white text-brand-700 shadow-md shadow-brand-500/10'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smile className="w-5 h-5 mb-1" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => { setRole('PARENT'); setError(null); }}
              className={`flex flex-col items-center justify-center py-3 rounded-xl text-xs font-extrabold transition-all ${
                role === 'PARENT'
                  ? 'bg-white text-emerald-700 shadow-md shadow-emerald-500/10'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-5 h-5 mb-1" />
              <span>Parent</span>
            </button>

            <button
              type="button"
              onClick={() => { setRole('TEACHER'); setError(null); }}
              className={`flex flex-col items-center justify-center py-3 rounded-xl text-xs font-extrabold transition-all ${
                role === 'TEACHER'
                  ? 'bg-white text-purple-700 shadow-md shadow-purple-500/10'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-5 h-5 mb-1" />
              <span>Teacher / Coach</span>
            </button>
          </div>

          {/* Child-friendly notice for students */}
          {role === 'STUDENT' && (
            <div className="mb-6 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>No email needed for students!</strong> Just choose a fun username and password.
              </span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {role === 'STUDENT' ? 'Student Nickname / Display Name' : 'Full Name'}
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-5 h-5" />
                </div>
                <input
                  id="displayName"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={role === 'STUDENT' ? 'e.g. Leo The Brave' : 'e.g. Sarah Jenkins'}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. tactics_wizard"
                className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Email (Parents & Teachers only) */}
            {role !== 'STUDENT' && (
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-5 h-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            {/* Title (Teachers only) */}
            {role === 'TEACHER' && (
              <div>
                <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Instructor Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. FIDE Instructor / School Chess Coach"
                  className="block w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-3 border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 h-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-3 border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-2xl shadow-lg shadow-brand-500/25 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-6 text-center text-xs text-slate-600 space-y-2">
            <p>
              Already registered in the academy?{' '}
              <Link href="/login" className="font-bold text-brand-600 hover:text-brand-700 underline">
                Sign In Here
              </Link>
            </p>
            <p>
              <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
                ← Back to Academy Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
