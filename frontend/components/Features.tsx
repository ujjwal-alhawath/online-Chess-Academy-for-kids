import { 
  Trophy, 
  Brain, 
  Bot, 
  Smile, 
  Target, 
  Users, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    color: 'from-amber-500 to-orange-500',
    title: 'Gamified Progress & Badges',
    description: 'Level up with daily learning streaks, unlock shiny badges, and earn XP for every solved puzzle and completed lesson.',
  },
  {
    icon: Brain,
    color: 'from-purple-500 to-indigo-500',
    title: 'Pattern Recognition Lab',
    description: 'Interactive tactics training teaches children to spot forks, pins, skewers, and checkmate patterns naturally through guided drills.',
  },
  {
    icon: Bot,
    color: 'from-blue-500 to-cyan-500',
    title: 'Friendly AI Sparring Bots',
    description: 'Children can play against patient bots tuned across beginner, easy, and medium skill tiers without intimidation or pressure.',
  },
  {
    icon: Smile,
    color: 'from-emerald-500 to-teal-500',
    title: 'Emotional Resilience & Reflection',
    description: 'Gentle post-game self-reflection prompts help kids process mistakes, practice patience, and celebrate positive sportsmanship.',
  },
  {
    icon: Trophy,
    color: 'from-yellow-500 to-amber-600',
    title: 'Academy Tournaments',
    description: 'Safe, moderated round-robin and Swiss tournaments designed to teach children fair competition and tournament etiquette.',
  },
  {
    icon: Users,
    color: 'from-rose-500 to-pink-500',
    title: 'Parent & Coach Observability',
    description: 'Dedicated dashboards for parents and coaches to monitor learning hours, tactic accuracy, and emotional mindset trends.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Academy Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Designed for Curious Young Minds
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Chess is more than just pieces on a board. Our platform combines cognitive challenge with playful motivation and emotional encouragement.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group relative bg-slate-50/70 hover:bg-white rounded-3xl p-8 border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

