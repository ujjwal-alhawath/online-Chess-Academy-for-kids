import { Trophy, Calendar, Users, Shield, Medal, Clock } from 'lucide-react';

const upcomingTournaments = [
  {
    title: 'Sunday Junior Rapid Cup',
    date: 'Every Sunday • 10:00 AM EST',
    timeControl: '10 min + 5 sec',
    players: '32 / 48 Enrolled',
    status: 'Registration Open',
    level: 'Beginners & Intermediates',
    tagColor: 'bg-emerald-100 text-emerald-800',
  },
  {
    title: 'Tactical Knights Arena',
    date: 'Wednesday • 4:30 PM EST',
    timeControl: '5 min + 3 sec',
    players: '18 / 24 Enrolled',
    status: 'Starting Soon',
    level: 'Tier 2 & 3 Players',
    tagColor: 'bg-amber-100 text-amber-800',
  },
  {
    title: 'Monthly Academy Championship',
    date: 'Last Saturday of Month',
    timeControl: '15 min + 10 sec',
    players: '64 Players Max',
    status: 'Upcoming',
    level: 'All Academy Students',
    tagColor: 'bg-purple-100 text-purple-800',
  },
];

export function TournamentsOverview() {
  return (
    <section id="tournaments" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Academy Competitions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Friendly Tournaments &amp; Sportsmanship
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Competitions designed to teach children sportsmanship, time management, and resilience in a supportive atmosphere.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {upcomingTournaments.map((tourney, idx) => (
            <div
              key={idx}
              className="bg-slate-50/80 rounded-3xl p-7 border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${tourney.tagColor}`}>
                    {tourney.status}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{tourney.timeControl}</span>
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 mb-2">{tourney.title}</h3>
                <p className="text-xs font-medium text-brand-600 mb-6">{tourney.level}</p>

                <div className="space-y-3 py-4 border-y border-slate-200/70 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{tourney.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{tourney.players}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span>Coach Moderated • Fair Play Certified</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  className="w-full py-3 rounded-xl text-center text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm"
                >
                  View Tournament Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
