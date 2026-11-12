'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Crown, Sparkles, Shield, User, Menu, X } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Crown className="w-6 h-6 fill-current text-amber-300" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                Kids Chess<span className="text-brand-600"> Academy</span>
              </span>
              <p className="text-xs font-medium text-slate-500 hidden sm:block">
                Strategic Thinking & Mastery
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-brand-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-brand-600 transition-colors">
              How It Works
            </a>
            <a href="#learning" className="hover:text-brand-600 transition-colors">
              Learning
            </a>
            <a href="#practice" className="hover:text-brand-600 transition-colors">
              Practice
            </a>
            <a href="#tournaments" className="hover:text-brand-600 transition-colors">
              Tournaments
            </a>
            <a href="#progress" className="hover:text-brand-600 transition-colors">
              Progress
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Shield className="w-4 h-4 text-emerald-600" />
              Parent Portal
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-md shadow-brand-500/25 transition-all transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Join Academy
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            How It Works
          </a>
          <a
            href="#learning"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            Learning
          </a>
          <a
            href="#practice"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            Practice
          </a>
          <a
            href="#tournaments"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            Tournaments
          </a>
          <a
            href="#progress"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            Progress
          </a>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              type="button"
              className="w-full py-2.5 rounded-xl text-center text-sm font-semibold text-slate-700 bg-slate-100"
            >
              Parent Portal
            </button>
            <button
              type="button"
              className="w-full py-2.5 rounded-xl text-center text-sm font-bold text-white bg-brand-600"
            >
              Join Academy
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
