import React, { useState } from 'react';

type InfoBoxVariant = 'blue' | 'green' | 'amber' | 'purple';

interface InfoBoxProps {
  title: string;
  children: React.ReactNode;
  variant?: InfoBoxVariant;
  icon?: string;
  collapsible?: boolean;
}

const VARIANTS: Record<InfoBoxVariant, { border: string; bg: string; title: string; text: string }> = {
  blue:   { border: 'border-blue-200',   bg: 'bg-blue-50',   title: 'text-blue-800',  text: 'text-blue-700'  },
  green:  { border: 'border-green-200',  bg: 'bg-green-50',  title: 'text-green-800', text: 'text-green-700' },
  amber:  { border: 'border-amber-200',  bg: 'bg-amber-50',  title: 'text-amber-800', text: 'text-amber-700' },
  purple: { border: 'border-purple-200', bg: 'bg-purple-50', title: 'text-purple-800',text: 'text-purple-700'},
};

/** A styled educational box for explaining concepts to homeowners/laymen. */
export function InfoBox({ title, children, variant = 'blue', icon = '💡', collapsible = false }: InfoBoxProps) {
  const [open, setOpen] = useState(true);
  const v = VARIANTS[variant];

  return (
    <div className={`rounded-xl border ${v.border} ${v.bg} p-4`}>
      <div
        className={`flex items-center gap-2 ${collapsible ? 'cursor-pointer select-none' : ''}`}
        onClick={collapsible ? () => setOpen(o => !o) : undefined}
      >
        <span className="text-lg leading-none">{icon}</span>
        <strong className={`text-sm font-semibold ${v.title} flex-1`}>{title}</strong>
        {collapsible && (
          <span className={`text-sm ${v.title} transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
        )}
      </div>
      {open && (
        <div className={`mt-2 text-sm ${v.text} space-y-1.5 leading-relaxed`}>{children}</div>
      )}
    </div>
  );
}

/** A single definition row: Term → plain-English explanation */
export function TermDef({ term, def }: { term: string; def: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="font-semibold text-slate-700 whitespace-nowrap min-w-[110px] shrink-0">{term}:</span>
      <span className="text-slate-600">{def}</span>
    </div>
  );
}
