import { BookOpen, Puzzle, Swords, Heart } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: BookOpen,
    title: 'Interactive Lessons',
    description: 'Learn one tactical concept at a time through bite-sized, animated chess positions with friendly voice and text guides.',
    badge: 'Step 1: Discover',
    color: 'bg-blue-500',
  },
  {
    step: '02',
    icon: Puzzle,
    title: 'Solve Daily Puzzles',
    description: 'Practice spotting forks, pins, and skewers in puzzles tailored to the student’s current chess rating.',
    badge: 'Step 2: Train',
    color: 'bg-purple-500',
  },
  {
    step: '03',
    icon: Swords,
    title: 'Play Safe AI & Peer Matches',
    description: 'Test newly acquired strategies against friendly AI bots or schoolmates with gentle time controls and legal move assistance.',
    badge: 'Step 3: Play',
    color: 'bg-amber-500',
  },
  {
    step: '04',
    icon: Heart,
    title: 'Reflect & Grow Resilient',
    description: 'After every match, celebrate what went well and reflect calmly on learning moments without fear of losing.',
    badge: 'Step 4: Reflect',
    color: 'bg-emerald-500',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Our 4-Step Learning Cycle
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Young Champions Learn &amp; Grow
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            A balanced approach that merges technical chess mastery with growth mindset habits.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl ${item.color} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-slate-200">{item.step}</span>
                </div>
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  {item.badge}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

