import { Sparkles, Trophy, Flame, Brain, ArrowRight, Play, HeartHandshake } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-brand-50/60 via-white to-slate-50">
      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-200/40 via-purple-200/30 to-amber-200/30 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Core Message */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs sm:text-sm font-bold border border-brand-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Gamified Online Chess Academy For Young Thinkers</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Kids Chess &amp; <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600">
                Strategic Thinking
              </span> Academy
            </h1>

            <p className="text-xl sm:text-2xl font-semibold text-slate-700 max-w-2xl mx-auto lg:mx-0">
              Learn chess. Think strategically. Grow confidently.
            </p>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              We turn chess into an exciting adventure where children develop deep concentration, tactical pattern recognition, sportsmanship, and emotional resilience through play.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <a
                href="#practice"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-extrabold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-xl shadow-brand-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Play className="w-5 h-5 fill-current" />
                Start Playing Free
              </a>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm hover:border-slate-300 transition-all"
              >
                How It Works
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <p className="text-2xl font-black text-slate-900">100%</p>
                <p className="text-xs font-medium text-slate-500">Child-Safe Environment</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">4 Levels</p>
                <p className="text-xs font-medium text-slate-500">Beginner to Master</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">Guided</p>
                <p className="text-xs font-medium text-slate-500">Emotional Growth</p>
              </div>
            </div>
          </div>

          {/* Right Column: Gamified Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 ring-1 ring-slate-900/5">
              
              {/* Header Profile preview */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-2xl flex items-center justify-center border-2 border-amber-300 shadow-inner">
                    🦁
                  </div>
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-base">Leo The Tactician</h2>
                    <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Level 4 Strategist
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold">
                  <Flame className="w-4 h-4 fill-current text-orange-500" />
                  <span>7 Day Streak</span>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="py-5 space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700">Tactical XP</span>
                    <span className="text-brand-600">840 / 1,000 XP</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full w-[84%] transition-all" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700">Pattern Recognition</span>
                    <span className="text-purple-600">75% Mastery</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-[75%] transition-all" />
                  </div>
                </div>
              </div>

              {/* Mini Chessboard Snapshot */}
              <div className="bg-slate-900 rounded-2xl p-4 text-white space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-amber-400" />
                    Daily Puzzle: White to Move
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                    +20 XP
                  </span>
                </div>

                {/* 4x4 Mini board preview */}
                <div className="grid grid-cols-4 gap-1 p-2 bg-slate-800 rounded-xl aspect-square max-w-[200px] mx-auto text-center font-mono text-2xl select-none">
                  <div className="bg-amber-100/90 rounded flex items-center justify-center">♜</div>
                  <div className="bg-amber-800/80 rounded flex items-center justify-center"></div>
                  <div className="bg-amber-100/90 rounded flex items-center justify-center">♚</div>
                  <div className="bg-amber-800/80 rounded flex items-center justify-center"></div>
                  <div className="bg-amber-800/80 rounded flex items-center justify-center"></div>
                  <div className="bg-amber-100/90 rounded flex items-center justify-center">♟</div>
                  <div className="bg-amber-800/80 rounded flex items-center justify-center"></div>
                  <div className="bg-amber-100/90 rounded flex items-center justify-center">♟</div>
                  <div className="bg-amber-100/90 rounded flex items-center justify-center"></div>
                  <div className="bg-amber-800/80 rounded flex items-center justify-center ring-2 ring-emerald-400">♘</div>
                  <div className="bg-amber-100/90 rounded flex items-center justify-center"></div>
                  <div className="bg-amber-800/80 rounded flex items-center justify-center"></div>
                  <div className="bg-amber-800/80 rounded flex items-center justify-center">♔</div>
                  <div className="bg-amber-100/90 rounded flex items-center justify-center"></div>
                  <div className="bg-amber-800/80 rounded flex items-center justify-center"></div>
                  <div className="bg-amber-100/90 rounded flex items-center justify-center">♕</div>
                </div>

                <p className="text-center text-xs text-amber-300 font-medium">
                  🎯 Fork the King and Rook with your Knight!
                </p>
              </div>

              {/* Reflection badge pill */}
              <div className="mt-4 flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-800">
                <HeartHandshake className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Post-Game Reflection: Stayed calm after mistake &amp; found checkmate!</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
