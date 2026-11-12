import { Bot, HelpCircle, Flame, CheckCircle, RefreshCw } from 'lucide-react';

export function PracticeArena() {
  return (
    <section id="practice" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background chess pattern subtle glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Description */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3.5 py-1.5 rounded-full border border-amber-400/20">
              Interactive Practice Arena
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Play Friendly Bots &amp; Solve Tactical Drills
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Young players can hone their tactical eyes with unlimited practice. Choose from patient AI sparring bots or tackle dynamic puzzles designed to make pattern recognition feel like second nature.
            </p>

            {/* Bot selector preview */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Choose AI Sparring Opponent</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border-2 border-emerald-500/80 text-center cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="text-2xl mb-1">🤖</div>
                  <p className="text-xs font-bold text-white">Bot Pippin</p>
                  <p className="text-[11px] text-emerald-400 font-semibold">Easy (600)</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="text-2xl mb-1">🦁</div>
                  <p className="text-xs font-bold text-white">Coach Leo</p>
                  <p className="text-[11px] text-amber-400 font-semibold">Medium (1000)</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="text-2xl mb-1">🦉</div>
                  <p className="text-xs font-bold text-white">Grandmaster Owl</p>
                  <p className="text-[11px] text-purple-400 font-semibold">Hard (1400)</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Legal move highlights
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Gentle hints on request
              </span>
            </div>
          </div>

          {/* Right Puzzle Interactive Mockup */}
          <div className="lg:col-span-6">
            <div className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700/80 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-brand-500/20 text-brand-400 text-xs font-bold">
                    Tactics Puzzle #108
                  </span>
                  <span className="text-xs text-slate-400">White to move • Mate in 1</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                  <Flame className="w-4 h-4 fill-current" />
                  +25 XP
                </div>
              </div>

              {/* Realistic 8x8 Board representation */}
              <div className="my-5 aspect-square max-w-[340px] mx-auto rounded-xl overflow-hidden border-4 border-amber-900/60 grid grid-cols-8 shadow-inner select-none">
                {[...Array(64)].map((_, i) => {
                  const row = Math.floor(i / 8);
                  const col = i % 8;
                  const isLight = (row + col) % 2 === 0;
                  
                  // Key pieces placement demo
                  let piece = '';
                  let highlight = false;
                  if (i === 11) piece = '♚'; // Black King at d7
                  if (i === 35) { piece = '♕'; highlight = true; } // White Queen at d4
                  if (i === 59) piece = '♔'; // White King at d1
                  if (i === 18) piece = '♟'; // Black Pawn
                  if (i === 19) piece = '♟'; // Black Pawn
                  if (i === 10) piece = '♜'; // Black Rook

                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-center text-2xl font-bold ${
                        isLight ? 'bg-[#f0d9b5] text-slate-800' : 'bg-[#b58863] text-slate-900'
                      } ${highlight ? 'ring-4 ring-emerald-400 ring-inset bg-emerald-200' : ''}`}
                    >
                      {piece}
                    </div>
                  );
                })}
              </div>

              {/* Tactical Question Prompt */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-700/60 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Find the winning tactical move:</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Deliver a clean checkmate with Queen to d7!</p>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 px-2.5 py-1 rounded-lg bg-amber-400/10"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Need Hint?
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left transition-colors"
                  >
                    A. Queen to e5
                  </button>
                  <button
                    type="button"
                    className="py-2.5 px-3 rounded-xl bg-emerald-600/30 text-emerald-300 border border-emerald-500/60 text-left font-bold"
                  >
                    B. Queen to d7 # (Checkmate)
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

