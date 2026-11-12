import React, { useState } from 'react';
import { Link2, Copy, Check, Shield, Users } from 'lucide-react';

interface ParentLinkCardProps {
  parentLinkCode?: string;
  className?: string;
}

export const ParentLinkCard: React.FC<ParentLinkCardProps> = ({
  parentLinkCode,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!parentLinkCode) return;
    navigator.clipboard.writeText(parentLinkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!parentLinkCode) return null;

  return (
    <div
      className={`bg-gradient-to-br from-indigo-50/70 via-white to-brand-50/50 rounded-3xl border border-indigo-100 p-6 shadow-sm relative overflow-hidden ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        {/* Left explanation */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="font-black text-slate-900 text-base">Parent & Coach Connection</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Share this link code with your parent or chess coach. When they enter it in their
            account, they can view your learning milestones, tournament stats, and celebrate your
            growth!
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span>Only share this code with trusted parents or verified academy teachers.</span>
          </div>
        </div>

        {/* Right Code Display & Copy */}
        <div className="bg-white border-2 border-indigo-200/80 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col items-center space-y-2 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
            Your Secret Link Code
          </span>
          <span className="text-xl sm:text-2xl font-black font-mono tracking-widest text-slate-900 px-3 py-1 bg-slate-50 rounded-xl border border-slate-200">
            {parentLinkCode}
          </span>
          <button
            onClick={handleCopy}
            className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

