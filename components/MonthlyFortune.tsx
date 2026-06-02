'use client';

import { useState } from 'react';
import { LocaleData, Locale } from '@/lib/i18n';
import { SajuResult } from '@/lib/saju/engine';
import { DailyFortune } from '@/app/api/monthly/route';

interface Props {
  saju: SajuResult;
  t: LocaleData;
  locale: Locale;
}

const scoreColors = ['', '#E74C3C', '#E67E22', '#F1C40F', '#2ECC71', '#3498DB'];
const scoreEmojis = ['', '😰', '😟', '😐', '😊', '🌟'];

function ScoreDot({ score }: { score: number }) {
  return (
    <div
      className="w-2 h-2 rounded-full flex-shrink-0"
      style={{ backgroundColor: scoreColors[score] }}
    />
  );
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className="score-bar flex-1 h-1.5">
        <div className="score-bar-fill h-full" style={{ width: `${(score / 5) * 100}%`, background: color }} />
      </div>
      <span className="text-xs" style={{ color }}>{score}</span>
    </div>
  );
}

export default function MonthlyFortune({ saju, t, locale }: Props) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [fortunes, setFortunes] = useState<DailyFortune[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saju, year, month, locale }),
      });
      const data = await res.json();
      setFortunes(data.fortunes || []);
      setLoaded(true);
    } catch {
      alert('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  const luckyDays = fortunes.filter(f => f.isLucky);
  const cautionDays = fortunes.filter(f => f.isCaution);

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-saju-gold/80 text-sm font-medium mb-1">{t.monthly.selectYear}</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full bg-saju-card border border-saju-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-saju-gold/60 appearance-none"
            >
              {years.map(y => <option key={y} value={y}>{y}년</option>)}
            </select>
          </div>
          <div>
            <label className="block text-saju-gold/80 text-sm font-medium mb-1">{t.monthly.selectMonth}</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full bg-saju-card border border-saju-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-saju-gold/60 appearance-none"
            >
              {t.form.months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-gold text-saju-black font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? '분석 중...' : t.monthly.submit}
        </button>
      </form>

      {loaded && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-green-900/20 border border-green-700/30">
              <div className="text-green-400 font-bold text-sm mb-1">🌟 {t.monthly.good}</div>
              <div className="flex flex-wrap gap-1">
                {luckyDays.map(f => (
                  <span key={f.day} className="text-xs bg-green-700/30 text-green-300 px-1.5 py-0.5 rounded">
                    {f.day}일
                  </span>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-red-900/20 border border-red-700/30">
              <div className="text-red-400 font-bold text-sm mb-1">⚠ {t.monthly.bad}</div>
              <div className="flex flex-wrap gap-1">
                {cautionDays.map(f => (
                  <span key={f.day} className="text-xs bg-red-700/30 text-red-300 px-1.5 py-0.5 rounded">
                    {f.day}일
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Daily list */}
          <div className="space-y-2">
            {fortunes.map((f) => (
              <DayCard key={f.day} fortune={f} t={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DayCard({ fortune: f, t }: { fortune: DailyFortune; t: LocaleData }) {
  const [open, setOpen] = useState(false);
  const bg = f.isLucky ? 'border-green-700/40 bg-green-900/10' :
             f.isCaution ? 'border-red-700/40 bg-red-900/10' :
             'border-saju-border bg-saju-card';

  return (
    <div
      className={`rounded-xl border p-3 cursor-pointer transition-colors ${bg}`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center gap-3">
        <div className="text-center w-10 flex-shrink-0">
          <div className="text-lg font-bold text-white">{f.day}</div>
          <div className="text-xs text-gray-500">일</div>
        </div>
        <div className="text-xl">{scoreEmojis[f.overall]}</div>
        <div className="flex-1 grid grid-cols-4 gap-1">
          <ScoreDot score={f.health} />
          <ScoreDot score={f.love} />
          <ScoreDot score={f.business} />
          <ScoreDot score={f.wealth} />
        </div>
        <div className="flex gap-1">
          {f.isLucky && <span className="text-xs text-green-400 bg-green-900/30 px-1.5 py-0.5 rounded-full">길</span>}
          {f.isCaution && <span className="text-xs text-red-400 bg-red-900/30 px-1.5 py-0.5 rounded-full">흉</span>}
        </div>
        <span className="text-gray-600 text-xs">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-saju-border space-y-2">
          {[
            { key: 'health', color: '#E74C3C', score: f.health, text: f.healthText, label: t.monthly.categories.health },
            { key: 'love', color: '#FF6B9D', score: f.love, text: f.loveText, label: t.monthly.categories.love },
            { key: 'business', color: '#3498DB', score: f.business, text: f.businessText, label: t.monthly.categories.business },
            { key: 'wealth', color: '#F39C12', score: f.wealth, text: f.wealthText, label: t.monthly.categories.wealth },
          ].map((item) => (
            <div key={item.key}>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium" style={{ color: item.color }}>{item.label}</span>
                <ScoreBar score={item.score} color={item.color} />
              </div>
              <p className="text-xs text-gray-400 pl-2">{item.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
