import { CheckCircle2, Star, Compass, Award } from 'lucide-react';

const curriculum = [
  {
    tier: 'Tier 1: Apprentice',
    rating: 'Rating 400 - 700',
    title: 'Fundamentals & Piece Energy',
    lessons: [
      'The Secret Powers of the Knight & Bishop',
      'The Pawn Chain: How Little Steps Win Big',
      'Castle Early: King Safety First',
      'Recognizing Check & Checkmate',
    ],
    status: 'Foundation',
    color: 'border-blue-200 bg-blue-50/40',
    badgeColor: 'text-blue-700 bg-blue-100',
  },
  {
    tier: 'Tier 2: Tactician',
    rating: 'Rating 700 - 1000',
    title: 'Pattern Recognition & Combinations',
    lessons: [
      'The Double Attack: Mastering The Royal Fork',
      'Pins & Skewers: Immobilizing Opponents',
      'Discovered Attack & Windmill Tactics',
      'Back Rank & Smothered Mate Patterns',
    ],
    status: 'Core Mastery',
    color: 'border-purple-200 bg-purple-50/40',
    badgeColor: 'text-purple-700 bg-purple-100',
  },
  {
    tier: 'Tier 3: Strategist',
    rating: 'Rating 1000 - 1300',
    title: 'Planning & Endgame Precision',
    lessons: [
      'Controlling the Golden Center',
      'The Art of Piece Coordination',
      'Opposition & King + Pawn Endgames',
      'Patience Under Pressure: Defending calmly',
    ],
    status: 'Strategic Depth',
    color: 'border-amber-200 bg-amber-50/40',
    badgeColor: 'text-amber-800 bg-amber-100',
  },
];

export function LearningPath() {
  return (
    <section id="learning" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
              Structured Curriculum
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              A Step-by-Step Pathway to Mastery
            </h2>
            <p className="text-base text-slate-600">
              Clear learning milestones designed by master instructors, breaking down complex strategic concepts into digestible lessons.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-600 bg-brand-50 px-4 py-2 rounded-2xl w-fit">
            <Award className="w-5 h-5" />
            <span>Over 120 Interactive Learning Modules</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {curriculum.map((track, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-8 border ${track.color} relative flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${track.badgeColor}`}>
                    {track.tier}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{track.rating}</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-6">{track.title}</h3>

                <ul className="space-y-3.5 mb-8">
                  {track.lessons.map((lesson, lIdx) => (
                    <li key={lIdx} className="flex items-start gap-3 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{lesson}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Focus: {track.status}</span>
                <span className="text-brand-600 flex items-center gap-1">
                  Explore <Star className="w-3.5 h-3.5 fill-current" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
