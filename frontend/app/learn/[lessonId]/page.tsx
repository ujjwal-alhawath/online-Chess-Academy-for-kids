'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Lock,
  Sparkles,
  Trophy,
  ArrowRight,
  Compass,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LessonService } from '@/services/lesson.service';
import { LessonDetailDTO, LessonStep } from '@/types/lesson.types';
import { LessonStepViewer } from '@/components/lesson/LessonStepViewer';

export default function LessonClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params?.lessonId as string;
  const { user, isLoading: isAuthLoading } = useAuth();

  const [lesson, setLesson] = useState<LessonDetailDTO | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const [activeStepNumber, setActiveStepNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Completion modal state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionData, setCompletionData] = useState<{
    xpAwarded: number;
    nextLessonId?: string;
  } | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  // Load lesson detail and start attempt
  const loadLesson = useCallback(async () => {
    if (!lessonId) return;

    setIsLoading(true);
    setLoadError(null);

    try {
      const res = await LessonService.getLesson(lessonId);
      if (res.success && res.lesson) {
        setLesson(res.lesson);
        setIsLocked(res.isLocked);
        setIsLessonCompleted(res.isCompleted);
        setActiveStepNumber(res.currentStep || 1);

        // If not locked, ensure lesson progress is initialized
        if (!res.isLocked) {
          try {
            await LessonService.startLesson(lessonId);
          } catch {
            // Ignore start error if already exists
          }
        }
      } else {
        setLoadError('Lesson not found or unavailable.');
      }
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : 'Error fetching lesson details.');
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    if (user && lessonId) {
      loadLesson();
    }
  }, [user, lessonId, loadLesson]);

  // Handle final completion
  const handleFinishLesson = async () => {
    if (!lesson) return;

    try {
      const res = await LessonService.completeLesson(lesson._id);
      setIsLessonCompleted(true);
      setCompletionData({
        xpAwarded: res.xpAwarded,
        nextLessonId: res.nextLessonId,
      });
      setShowCompletionModal(true);
    } catch (err: unknown) {
      console.error('Error completing lesson:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mx-auto animate-bounce">
            <GraduationCap className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-600">Preparing Academy Classroom...</p>
        </div>
      </div>
    );
  }

  if (loadError || !lesson) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-rose-200 p-8 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-black text-slate-900 text-lg">Unable to Open Lesson</h3>
          <p className="text-xs text-slate-600">{loadError || 'Lesson content is unavailable.'}</p>
          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Curriculum</span>
          </Link>
        </div>
      </div>
    );
  }

  // Locked Lesson Guard View
  if (isLocked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full text-center space-y-5 shadow-lg">
          <div className="w-14 h-14 rounded-3xl bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-slate-900 text-xl">Curriculum Locked</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To understand this advanced lesson, you must first complete the preceding lesson in the academy curriculum.
            </p>
          </div>
          <Link
            href="/learn"
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black shadow-md transition-all"
          >
            <span>View Unlocked Lessons</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const currentStep =
    lesson.content.find((s) => s.stepNumber === activeStepNumber) || lesson.content[0];
  const isLastStep = activeStepNumber >= lesson.content.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/learn"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Back to Curriculum"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-black text-slate-900 truncate max-w-[200px] sm:max-w-md">
                  {lesson.title}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700">
                  {lesson.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Step {activeStepNumber} of {lesson.content.length}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
              +{lesson.xpReward} XP
            </span>
          </div>
        </div>
      </header>

      {/* Main Classroom Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Step Progress Stepper */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
            {lesson.content.map((s) => {
              const isActive = s.stepNumber === activeStepNumber;
              const isPast = s.stepNumber < activeStepNumber || isLessonCompleted;

              return (
                <button
                  key={s.stepNumber}
                  type="button"
                  onClick={() => {
                    // Allow navigating freely to past or active steps
                    if (s.stepNumber <= activeStepNumber || isLessonCompleted) {
                      setActiveStepNumber(s.stepNumber);
                    }
                  }}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-300'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {isPast && !isActive ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <span>{s.stepNumber}</span>
                  )}
                  <span className="text-[11px]">
                    {s.type === 'TEXT' ? 'Concept' : s.type === 'MULTIPLE_CHOICE' ? 'Quiz' : 'Board'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Content Viewer */}
        <LessonStepViewer
          step={currentStep}
          lessonId={lesson._id}
          isCompleted={isLessonCompleted}
          isLastStep={isLastStep}
          onStepComplete={(nextStep) => setActiveStepNumber(nextStep)}
          onLessonFinish={handleFinishLesson}
        />
      </main>

      {/* Celebration Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-brand-300 text-center space-y-6 relative overflow-hidden">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center text-3xl mx-auto shadow-lg shadow-brand-500/30">
              🎓
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Lesson Mastered!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Outstanding focus! You completed every step and earned strategic mastery.
              </p>
            </div>

            {/* XP Award Banner */}
            <div className="bg-gradient-to-r from-amber-50 via-brand-50 to-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-left">
                <div className="p-2 rounded-xl bg-amber-400 text-slate-950">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Academy Reward</p>
                  <p className="text-xs font-black text-slate-900">
                    {completionData?.xpAwarded && completionData.xpAwarded > 0
                      ? 'First Completion Bonus'
                      : 'Mastery Review Recorded'}
                  </p>
                </div>
              </div>
              <span className="text-lg font-black text-amber-600">
                {completionData?.xpAwarded && completionData.xpAwarded > 0
                  ? `+${completionData.xpAwarded} XP`
                  : '✓ Completed'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 pt-2">
              {completionData?.nextLessonId ? (
                <Link
                  href={`/learn/${completionData.nextLessonId}`}
                  onClick={() => setShowCompletionModal(false)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs py-3.5 px-4 rounded-xl shadow-md transition-all hover:scale-[1.01]"
                >
                  <span>Continue to Next Lesson</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : null}

              <Link
                href="/puzzles"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3.5 px-4 rounded-xl shadow-md transition-all"
              >
                <span>Practice Tactical Puzzles</span>
                <Trophy className="w-4 h-4" />
              </Link>

              <Link
                href="/learn"
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 px-4 rounded-xl transition-all"
              >
                <span>Back to Curriculum Roadmap</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

