import { Sparkles, Shield, ArrowRight } from 'lucide-react';

export function CallToAction() {
  return (
    <section className="py-20 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold border border-white/20">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Begin Your Strategic Journey Today</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-3xl mx-auto leading-tight">
          Give Your Child The Gift of Strategic Thinking
        </h2>

        <p className="text-base sm:text-xl text-brand-100 max-w-2xl mx-auto leading-relaxed">
          Join thousands of young minds building concentration, tactical creativity, and emotional poise on the chess board.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-extrabold text-brand-900 bg-white hover:bg-slate-100 shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Enroll Free as Student
            <ArrowRight className="w-5 h-5 text-brand-600" />
          </button>
          <button
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-base font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all"
          >
            <Shield className="w-4 h-4 text-emerald-300" />
            Parent &amp; Educator Access
          </button>
        </div>

        <p className="text-xs text-brand-200">
          ✓ No credit card required • 100% child-friendly environment • COPPA-aligned data privacy
        </p>
      </div>
    </section>
  );
}

