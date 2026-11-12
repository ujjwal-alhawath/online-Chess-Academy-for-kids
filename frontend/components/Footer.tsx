import Link from 'next/link';
import { Crown, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white">
                <Crown className="w-5 h-5 text-amber-300" />
              </div>
              <span className="text-xl font-extrabold text-white">
                Kids Chess<span className="text-brand-400"> Academy</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Empowering children through gamified chess mastery, tactical pattern recognition, and self-reflective resilience.
            </p>
            <p className="text-xs text-slate-500">
              Subtitle: Learn chess. Think strategically. Grow confidently.
            </p>
          </div>

          {/* Column 1: Learning */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Academy</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#learning" className="hover:text-white transition-colors">Chess Fundamentals</a></li>
              <li><a href="#learning" className="hover:text-white transition-colors">Tactics &amp; Patterns</a></li>
              <li><a href="#practice" className="hover:text-white transition-colors">Daily Puzzles</a></li>
              <li><a href="#tournaments" className="hover:text-white transition-colors">Tournaments</a></li>
            </ul>
          </div>

          {/* Column 2: Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Portals</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-slate-500">Student Dashboard (Phase 4)</span></li>
              <li><span className="text-slate-500">Parent Monitoring (Phase 10)</span></li>
              <li><span className="text-slate-500">Coach Workspace (Phase 9)</span></li>
              <li><span className="text-slate-500">Admin Control (Phase 11)</span></li>
            </ul>
          </div>

          {/* Column 3: Safety & Values */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Values</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-white cursor-pointer">Child Safety</span></li>
              <li><span className="hover:text-white cursor-pointer">Growth Mindset</span></li>
              <li><span className="hover:text-white cursor-pointer">Fair Competition</span></li>
              <li><span className="hover:text-white cursor-pointer">Privacy First</span></li>
            </ul>
          </div>

        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="pt-8 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-300">Educational Notice:</span> Activity indicators, streaks, and emotional reflection activities on this platform are designed solely to encourage persistence, self-reflection, and healthy sportsmanship. They do not constitute psychological, medical, or clinical assessments.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} Kids Chess &amp; Strategic Thinking Academy. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> for young champions
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

