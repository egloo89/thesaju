'use client';

import { useState } from 'react';
import { LocaleData } from '@/lib/i18n';
import { SajuResult } from '@/lib/saju/engine';

interface Props {
  t: LocaleData;
  onResult: (saju: SajuResult, formData: FormData) => void;
  onLoading: (loading: boolean) => void;
}

export interface FormData {
  year: number;
  month: number;
  day: number;
  hour?: number;
  gender: 'male' | 'female';
  timeUnknown: boolean;
  calendarType: 'solar' | 'lunar';
  isLeapMonth: boolean;
}

// 12시진: 시간대 + 로케일별 시진명 (ko=한글, en=범위만, CJK=한자)
const HOUR_RANGES = [
  '23:00~01:00', '01:00~03:00', '03:00~05:00', '05:00~07:00',
  '07:00~09:00', '09:00~11:00', '11:00~13:00', '13:00~15:00',
  '15:00~17:00', '17:00~19:00', '19:00~21:00', '21:00~23:00',
];
const HOUR_KOR = ['자시', '축시', '인시', '묘시', '진시', '사시', '오시', '미시', '신시', '유시', '술시', '해시'];
const HOUR_HANJA = ['子時', '丑時', '寅時', '卯時', '辰時', '巳時', '午時', '未時', '申時', '酉時', '戌時', '亥時'];

function hourLabel(i: number, locale: string): string {
  if (locale === 'en') return HOUR_RANGES[i];
  const name = locale === 'ko' ? HOUR_KOR[i] : HOUR_HANJA[i];
  return `${HOUR_RANGES[i]} (${name})`;
}

export default function SajuForm({ t, onResult, onLoading }: Props) {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!year || !month || !day) {
      setError(t.form.errDate);
      return;
    }
    if (!timeUnknown && !hour) {
      setError(t.form.errTime);
      return;
    }

    // 시진(時辰) 인덱스(0~11) → 실제 대표 시각(0~23시) 변환
    // 0 자시→0, 1 축시→2, 2 인시→4 ... 10 술시→20, 11 해시→22
    const HOUR_INDEX_TO_CLOCK = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
    const realHour = timeUnknown ? undefined : HOUR_INDEX_TO_CLOCK[Number(hour)];

    onLoading(true);
    try {
      const res = await fetch('/api/saju', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: Number(year),
          month: Number(month),
          day: Number(day),
          hour: realHour,
          gender,
          timeUnknown,
          calendarType,
          isLeapMonth: calendarType === 'lunar' ? isLeapMonth : false,
        }),
      });

      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      onResult(data.saju, {
        year: Number(year), month: Number(month), day: Number(day),
        hour: realHour,
        gender, timeUnknown,
        calendarType, isLeapMonth: calendarType === 'lunar' ? isLeapMonth : false,
      });
    } catch {
      setError(t.form.errGeneric);
    } finally {
      onLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Gender */}
      <div>
        <label className="block text-saju-gold/80 text-sm font-medium mb-2">{t.form.gender}</label>
        <div className="grid grid-cols-2 gap-3">
          {(['male', 'female'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`py-3 rounded-xl border font-medium transition-all ${
                gender === g
                  ? 'border-saju-gold bg-saju-gold/10 text-saju-gold'
                  : 'border-saju-border text-gray-400 hover:border-saju-gold/40'
              }`}
            >
              {g === 'male' ? `♂ ${t.form.male}` : `♀ ${t.form.female}`}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar type: Solar / Lunar */}
      <div>
        <label className="block text-saju-gold/80 text-sm font-medium mb-2">{t.form.calendarLabel}</label>
        <div className="grid grid-cols-2 gap-3">
          {(['solar', 'lunar'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { setCalendarType(c); if (c === 'solar') setIsLeapMonth(false); }}
              className={`py-3 rounded-xl border font-medium transition-all ${
                calendarType === c
                  ? 'border-saju-gold bg-saju-gold/10 text-saju-gold'
                  : 'border-saju-border text-gray-400 hover:border-saju-gold/40'
              }`}
            >
              {c === 'solar' ? `☀ ${t.form.solar}` : `🌙 ${t.form.lunar}`}
            </button>
          ))}
        </div>
        {calendarType === 'lunar' && (
          <label className="flex items-center gap-2 cursor-pointer mt-3">
            <input
              type="checkbox"
              checked={isLeapMonth}
              onChange={(e) => setIsLeapMonth(e.target.checked)}
              className="w-4 h-4 accent-saju-gold"
            />
            <span className="text-sm text-gray-400">{t.form.leapMonth}</span>
          </label>
        )}
      </div>

      {/* Year */}
      <div>
        <label className="block text-saju-gold/80 text-sm font-medium mb-2">{t.form.year}</label>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full bg-saju-card border border-saju-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-saju-gold/60 appearance-none"
        >
          <option value="">{t.form.yearPlaceholder}</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}{t.form.yearUnit}</option>
          ))}
        </select>
      </div>

      {/* Month & Day */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-saju-gold/80 text-sm font-medium mb-2">{t.form.month}</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full bg-saju-card border border-saju-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-saju-gold/60 appearance-none"
          >
            <option value="">{t.form.selectMonth}</option>
            {t.form.months.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-saju-gold/80 text-sm font-medium mb-2">{t.form.day}</label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full bg-saju-card border border-saju-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-saju-gold/60 appearance-none"
          >
            <option value="">{t.form.selectDay}</option>
            {days.map((d) => (
              <option key={d} value={d}>{d}{t.form.dayUnit}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Hour */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-saju-gold/80 text-sm font-medium">{t.form.hour}</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={timeUnknown}
              onChange={(e) => setTimeUnknown(e.target.checked)}
              className="w-4 h-4 accent-saju-gold"
            />
            <span className="text-sm text-gray-400">{t.form.timeUnknown}</span>
          </label>
        </div>
        {!timeUnknown && (
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="w-full bg-saju-card border border-saju-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-saju-gold/60 appearance-none"
          >
            <option value="">{t.form.selectHour}</option>
            {HOUR_RANGES.map((_, i) => (
              <option key={i} value={i}>{hourLabel(i, t.locale)}</option>
            ))}
          </select>
        )}
        {timeUnknown && (
          <p className="text-gray-500 text-sm py-2 px-4 bg-saju-card rounded-xl border border-saju-border">
            {t.form.timeUnknownDesc}
          </p>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full py-4 bg-gradient-gold text-saju-black font-bold text-lg rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-gold-lg"
      >
        {t.form.submit}
      </button>
    </form>
  );
}
