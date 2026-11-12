import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'brand' | 'amber' | 'emerald' | 'purple' | 'rose';
  badge?: string;
}

const colorMap = {
  brand: {
    bg: 'bg-brand-50',
    iconColor: 'text-brand-600',
    badgeBg: 'bg-brand-100 text-brand-700',
    border: 'border-brand-100',
  },
  amber: {
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    badgeBg: 'bg-amber-100 text-amber-800',
    border: 'border-amber-100',
  },
  emerald: {
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    border: 'border-emerald-100',
  },
  purple: {
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    badgeBg: 'bg-purple-100 text-purple-800',
    border: 'border-purple-100',
  },
  rose: {
    bg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    badgeBg: 'bg-rose-100 text-rose-800',
    border: 'border-rose-100',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'brand',
  badge,
}) => {
  const scheme = colorMap[color];

  return (
    <div
      className={`bg-white rounded-2xl border ${scheme.border} p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{value}</span>
            {badge && (
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${scheme.badgeBg}`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

