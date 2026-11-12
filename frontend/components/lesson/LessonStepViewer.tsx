'use client';

import React, { useState, useEffect } from 'react';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { LessonStep } from '@/types/lesson.types';
import { LessonService } from '@/services/lesson.service';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Trophy,
} from 'lucide-react';

interface LessonStepViewerProps {
  step: LessonStep;
  lessonId: string;
  isCompleted?: boolean;
  isLastStep: boolean;
  onStepComplete: (nextStepNumber: number) => void;
  onLessonFinish: () => void;
}

export const LessonStepViewer: React.FC<LessonStepViewerProps> = ({
  step,
  lessonId,
  isCompleted = false,
  isLastStep,
  onStepComplete,
  onLessonFinish,
}) => {
  // State for multiple choice
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // State for interactive board
  const [boardFen, setBoardFen] = useState<string>(step.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | undefined>(undefined);

  // General feedback and submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    explanation?: string;
    message: string;
  } | null>(null);
  const [stepSolved, setStepSolved] = useState(false);

  // Reset state when step changes
  useEffect(() => {
    setSelectedOption(null);
    setBoardFen(step.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    setLastMove(undefined);
    setFeedback(null);
    setStepSolved(false);
  }, [step]);

  // Handle Text Step Progression
  const handleTextContinue = async () => {
    setIsSubmitting(true);
    try {
      const res = await LessonService.submitStep(lessonId, step.stepNumber, {});
      if (res.isCorrect) {
        if (isLastStep) {
          onLessonFinish();
        } else {
          onStepComplete(res.nextStep);
        }
      }
    } catch (err: unknown) {
      console.error('Failed to advance step:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Multiple Choice Submission
  const handleChoiceSubmit = async () => {
    if (!selectedOption || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await LessonService.submitStep(lessonId, step.stepNumber, {
        selectedAnswer: selectedOption,
      });

      if (res.isCorrect) {
        setStepSolved(true);
        setFeedback({
          isCorrect: true,
          explanation: res.explanation || 'Excellent thinking! That is correct.',
          message: 'Spot on! Correct answer.',
        });
      } else {
        setFeedback({
          isCorrect: false,
          explanation: res.explanation,
          message: 'Not quite right. Take another look and try again!',
        });
      }
    } catch (err: unknown) {
      setFeedback({
        isCorrect: false,
        message: err instanceof Error ? err.message : 'Error validating your choice.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Interactive Board Move
  const handleInteractiveMove = async (move: { from: string; to: string; promotion?: 'q' | 'r' | 'b' | 'n' }) => {
    if (stepSolved || isSubmitting) return;

    setLastMove({ from: move.from, to: move.to });
    setIsSubmitting(true);

    try {
      const res = await LessonService.submitStep(lessonId, step.stepNumber, {
        interactiveMove: {
          from: move.from,
          to: move.to,
          promotion: move.promotion,
        },
      });

      if (res.isCorrect) {
        setStepSolved(true);
        setFeedback({
          isCorrect: true,
          explanation: res.explanation || 'Great move! You found the key tactic.',
          message: 'Splendid Move! Perfect tactical execution.',
        });
      } else {
        setFeedback({
          isCorrect: false,
          explanation: res.explanation,
          message: 'That move did not accomplish the mission. Reset and try another idea!',
        });
      }
    } catch (err: unknown) {
      setFeedback({
        isCorrect: false,
        message: err instanceof Error ? err.message : 'Invalid move attempt.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset interactive board to starting step FEN
  const handleResetBoard = () => {
    setBoardFen(step.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    setLastMove(undefined);
    setFeedback(null);
    setStepSolved(false);
  };

  // Next / Finish button handler after a step is correctly answered
  const handleAdvance = () => {
    if (isLastStep) {
      onLessonFinish();
    } else {
      onStepComplete(step.stepNumber + 1);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* STEP TYPE 1: TEXT                                             */}
      {/* ------------------------------------------------------------- */}
      {step.type === 'TEXT' && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="p-2.5 rounded-2xl bg-brand-50 text-brand-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Academy Concept
              </p>
              <h3 className="text-xl font-black text-slate-900">
                Step {step.stepNumber}: Study &amp; Observe
              </h3>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 prose prose-slate max-w-none">
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium whitespace-pre-line">
              {step.text}
            </p>
          </div>

          {step.explanation && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-950 font-semibold leading-relaxed">
                💡 <span className="font-bold">Key Insight:</span> {step.explanation}
              </p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleTextContinue}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-black text-sm shadow-md shadow-brand-600/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <span>{isLastStep ? 'Complete Lesson' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP TYPE 2: MULTIPLE CHOICE                                  */}
      {/* ------------------------------------------------------------- */}
      {step.type === 'MULTIPLE_CHOICE' && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Knowledge Check
              </p>
              <h3 className="text-xl font-black text-slate-900">
                Step {step.stepNumber}: Test Your Understanding
              </h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              {step.question || 'Which of the following is correct?'}
            </h4>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {step.options?.map((option, idx) => {
              const isSelected = selectedOption === option;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={stepSolved}
                  onClick={() => setSelectedOption(option)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-brand-50 border-brand-500 shadow-sm ring-2 ring-brand-500/20'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                        isSelected
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm font-bold text-slate-800">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div
              className={`p-4 rounded-2xl border flex items-start space-x-3 transition-all ${
                feedback.isCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              {feedback.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs space-y-1">
                <p className="font-extrabold">{feedback.message}</p>
                {feedback.explanation && (
                  <p className="font-medium text-slate-700">{feedback.explanation}</p>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-2">
            {feedback && !stepSolved ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedOption(null);
                  setFeedback(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Another Answer</span>
              </button>
            ) : <div />}

            {stepSolved ? (
              <button
                type="button"
                onClick={handleAdvance}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md shadow-emerald-600/25 transition-all hover:scale-105 active:scale-95"
              >
                <span>{isLastStep ? 'Finish Lesson' : 'Next Step'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleChoiceSubmit}
                disabled={!selectedOption || isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-black text-sm shadow-md shadow-brand-600/25 transition-all disabled:opacity-50"
              >
                <span>Check Answer</span>
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP TYPE 3: INTERACTIVE BOARD                                */}
      {/* ------------------------------------------------------------- */}
      {step.type === 'INTERACTIVE_BOARD' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Interactive Board
                </p>
                <h3 className="text-xl font-black text-slate-900">
                  Step {step.stepNumber}: Play the Best Move
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetBoard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Board</span>
            </button>
          </div>

          {step.text && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                🎯 {step.text}
              </p>
            </div>
          )}

          {/* Interactive Chessboard Component */}
          <div className="flex justify-center py-2">
            <div className="w-full max-w-[440px]">
              <ChessBoard
                fen={boardFen}
                orientation="white"
                playerColor="w"
                disabled={stepSolved || isSubmitting}
                lastMove={lastMove}
                onMove={handleInteractiveMove}
              />
            </div>
          </div>

          {/* Feedback message */}
          {feedback && (
            <div
              className={`p-4 rounded-2xl border flex items-start space-x-3 transition-all ${
                feedback.isCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              {feedback.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs space-y-1">
                <p className="font-extrabold">{feedback.message}</p>
                {feedback.explanation && (
                  <p className="font-medium text-slate-700">{feedback.explanation}</p>
                )}
              </div>
            </div>
          )}

          {/* Completion Button */}
          {stepSolved && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleAdvance}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md shadow-emerald-600/25 transition-all hover:scale-105 active:scale-95"
              >
                <span>{isLastStep ? 'Finish Lesson' : 'Next Step'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
