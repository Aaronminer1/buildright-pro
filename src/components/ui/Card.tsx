import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ children, className = '', title, subtitle, action, padding = 'md' }: CardProps) {
  const padClass = { sm: 'p-3', md: 'p-5', lg: 'p-6' }[padding];
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${padClass} ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && <h3 className="font-semibold text-slate-800 text-base">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="ml-4 flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

interface ResultCardProps {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
  note?: string;
  small?: boolean;
}

export function ResultCard({ label, value, unit, highlight, note, small }: ResultCardProps) {
  if (highlight) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
        <div className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">{label}</div>
        <div className="text-3xl font-bold text-amber-800">{value}</div>
        {unit && <div className="text-sm text-amber-600 mt-0.5">{unit}</div>}
        {note && <div className="text-xs text-amber-600 mt-1 italic">{note}</div>}
      </div>
    );
  }
  return (
    <div className={`bg-slate-50 border border-slate-200 rounded-lg text-center ${small ? 'p-3' : 'p-4'}`}>
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</div>
      <div className={`font-bold text-slate-800 ${small ? 'text-xl' : 'text-2xl'}`}>{value}</div>
      {unit && <div className="text-xs text-slate-500 mt-0.5">{unit}</div>}
      {note && <div className="text-xs text-slate-400 mt-1 italic">{note}</div>}
    </div>
  );
}
