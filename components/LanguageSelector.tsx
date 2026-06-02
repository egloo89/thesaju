'use client';

import { useState } from 'react';
import { Locale, localeNames, localeFlags } from '@/lib/i18n';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface Props {
  locale: Locale;
  onChange: (locale: Locale) => void;
}

const localeOrder: Locale[] = ['ko', 'ja', 'zh', 'tw', 'en'];

export default function LanguageSelector({ locale, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-saju-border bg-saju-card hover:border-saju-gold/40 transition-colors text-sm"
      >
        <span>{localeFlags[locale]}</span>
        <span className="text-saju-gold/80 font-medium">{localeNames[locale]}</span>
        <ChevronDownIcon className={`w-3.5 h-3.5 text-saju-gold/60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-saju-card border border-saju-border rounded-xl shadow-card overflow-hidden min-w-[160px]">
            {localeOrder.map((l) => (
              <button
                key={l}
                onClick={() => { onChange(l); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-saju-border/50 transition-colors text-left ${
                  l === locale ? 'text-saju-gold bg-saju-gold/10' : 'text-gray-300'
                }`}
              >
                <span className="text-base">{localeFlags[l]}</span>
                <span>{localeNames[l]}</span>
                {l === locale && <span className="ml-auto text-saju-gold text-xs">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Heroicons shim
function ChevronDownIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}
