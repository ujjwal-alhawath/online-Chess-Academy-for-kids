import React from 'react';
import { Crown, Sparkles, BookOpen, Swords } from 'lucide-react';
import Link from 'next/link';

interface StudentHeaderProps {
  displayName: string;
  avatar?: string;
  rating: number;
  level: number;
}

const STRATEGIC_QUOTES = [
  '“Every master was once a beginner.” — Irving Chernev',
  '“When you see a good move, look for a better one.” — Emanuel Lasker',
  '“In chess, just as in life, today’s mistake is tomorrow’s wisdom.”',
  '“Patience and calm breathing reveal tactics others rush past.”',
  '“A champion never gives up; they analyze, adapt, and improve.”',
];

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  displayName,
  avatar = '🦁',
  rating,
  level,
}) => {
  // Deterministic daily quote selection based on today's day of month
  const dayIndex = new Date().getDate() % STRATEGIC_QUOTES.length;
  const quote = STRATEGIC_QUOTES[dayIndex];

  return (
    <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
      {/* Decorative background chess motifs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-12 -translate-y-12" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Avatar + Greeting + Quote */}
        <div className="flex items-start sm:items-center space-x-4 sm:space-x-5">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-3xl sm:text-4xl shadow-inner">
              {avatar || '🦁'}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-1.5 rounded-lg shadow-md border-2 border-brand-600">
              <Crown className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-brand-500/80 text-amber-300 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Level {level} Cadet
              </span>
              <span className="bg-white/15 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                Rating: {rating}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {displayName}!
            </h1>

            <p className="text-xs sm:text-sm text-brand-100 font-medium italic max-w-xl">
              {quote}
            </p>
          </div>
        </div>

        {/* Right: Quick Launch actions */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 self-stretch md:self-auto justify-end">
          <Link
            href="/play"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm px-5 py-3 rounded-2xl shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Swords className="w-4 h-4" />
            <span>Play Match</span>
          </Link>
          <Link
            href="#learning-path"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white font-extrabold text-sm px-5 py-3 rounded-2xl border border-white/30 backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <BookOpen className="w-4 h-4" />
            <span>Lessons</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

