import { Flame, Star, Trophy, TrendingUp, CheckCircle, HeartHandshake } from 'lucide-react';

const badges = [
  { icon: '🌟', name: 'First Puzzle', desc: 'Solved your very first tactical puzzle!' },
  { icon: '♟️', name: 'Chess Explorer', desc: 'Explored 10 opening ideas' },
  { icon: '🧠', name: 'Fork Master', desc: 'Mastered double attack tactics' },
  { icon: '🔥', name: '7-Day Streak', desc: 'Practiced 7 consecutive days' },
  { icon: '🏆', name: 'Fair Competitor', desc: 'Completed a tournament with sportsmanship' },
  { icon: '🎯', name: 'Tactical Thinker', desc: 'Achieved 80% accuracy in tactics' },
];

export function ProgressSection() {
  return (
    <section id="progress" className="py-20 bg-slate-50 border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Growth &amp; Gamification
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Celebrate Every Learning Milestone
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Our indicators highlight effort, consistency, and curiosity. We encourage healthy self-reflection rather than high-stakes stress.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Progress Bars & Reflection Showcase */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-600" />
              Activity &amp; Skill Progression
            </h3>

            {/* Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm font-bold text-slate-700 mb-1.5">
                  <span>Chess Fundamentals</span>
                  <span className="text-brand-600">80% Completed</span>
                </div>
                <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-brand-600 rounded-full w-[80%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold text-slate-700 mb-1.5">
                  <span>Pattern Recognition</span>
                  <span className="text-purple-600">70% Mastery</span>
                </div>
                <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-purple-600 rounded-full w-[70%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold text-slate-700 mb-1.5">
                  <span>Strategic Thinking Drills</span>
                  <span className="text-amber-600">60% Proficient</span>
                </div>
                <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-amber-500 rounded-full w-[60%]" />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between p-4 bg-orange-50/70 border border-orange-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md">
                    <Flame className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-orange-950">Learning Streak</h4>
                    <p className="text-xs text-orange-800">7 days of consistent practice</p>
                  </div>
                </div>
                <span className="text-lg font-black text-orange-600">🔥 7 Days</span>
              </div>
            </div>

            {/* Growth Mindset note */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs space-y-1">
              <p className="font-extrabold flex items-center gap-1.5 text-emerald-800">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                Growth Mindset Indicator
              </p>
              <p className="text-slate-600 leading-relaxed">
                Metrics reflect learning activity and practice time. They are designed to encourage persistence and self-confidence.
              </p>
            </div>
          </div>

          {/* Badges Showcase */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Collectable Achievement Badges
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {badges.map((b, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center hover:bg-amber-50/50 hover:border-amber-200 transition-colors"
                >
                  <div className="text-3xl mb-2">{b.icon}</div>
                  <h4 className="text-xs font-extrabold text-slate-900 mb-1">{b.name}</h4>
                  <p className="text-[11px] text-slate-500 leading-tight">{b.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-slate-100/70 text-center text-xs font-semibold text-slate-600">
              Over 40+ unique achievements to unlock throughout the academy journey!
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

